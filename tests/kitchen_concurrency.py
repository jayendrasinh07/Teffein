"""Local/CI only: independent sessions race status changes against retries/cancellation."""
import concurrent.futures
import os
import subprocess
import uuid

PSQL = os.environ.get('PSQL', 'psql')

def sql(query, check=True):
    result = subprocess.run([PSQL, '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], input=query, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(result.stderr)
    return result

owner, staff, other_staff, order = [str(uuid.uuid4()) for _ in range(4)]

def kitchen(actor, expected='confirmed', next_status='preparing'):
    return f"begin;set local role authenticated;set local request.jwt.claim.sub='{actor}';select public.update_kitchen_order_status('{order}','{expected}','{next_status}')->>'status';select pg_sleep(0.2);commit;"

try:
    sql(f"""insert into auth.users(id,email,raw_user_meta_data) values
      ('{owner}','{owner}@example.invalid','{{}}'),('{staff}','{staff}@example.invalid','{{}}'),('{other_staff}','{other_staff}@example.invalid','{{}}');
      insert into public.user_roles(user_id,role) values('{staff}','kitchen'),('{other_staff}','kitchen');
      insert into public.orders(id,user_id,order_number,idempotency_key,request_payload,order_date,meal_type,status)
      values('{order}','{owner}','{order}',gen_random_uuid(),'{{}}',(clock_timestamp() at time zone 'Asia/Kolkata')::date+1,'lunch','confirmed');
    """)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda actor: sql(kitchen(actor), False), [staff, other_staff]))
    assert all(r.returncode == 0 for r in results), [(r.stdout,r.stderr) for r in results]
    assert sql(f"select count(*) from private.kitchen_status_events where order_id='{order}'").stdout.strip() == '1'
    sql(kitchen(staff, 'preparing', 'ready'))
    assert 'This order has changed' in sql(kitchen(other_staff), False).stderr
    # Hold the order row before dispatching the competitor, making each lock winner deterministic.
    for first in ['cancel', 'kitchen']:
        sql(f"delete from private.kitchen_status_events where order_id='{order}';update public.orders set status='confirmed' where id='{order}';")
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            holder = subprocess.Popen([PSQL, '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            holder.stdin.write(f"begin;select id from public.orders where id='{order}' for update;\n")
            holder.stdin.flush()
            assert holder.stdout.readline().strip() == order
            cancel = f"set local role authenticated;set local request.jwt.claim.sub='{owner}';select public.cancel_customer_order('{order}')->>'status';"
            prepare = f"set local role authenticated;set local request.jwt.claim.sub='{staff}';select public.update_kitchen_order_status('{order}','confirmed','preparing')->>'status';"
            rival = pool.submit(sql, f"begin;{prepare if first == 'cancel' else cancel}commit;", False)
            holder.stdin.write((cancel if first == 'cancel' else prepare) + 'commit;\n')
            holder.stdin.close(); holder.wait(timeout=10)
            assert holder.returncode == 0, holder.stderr.read()
            outcome = rival.result(timeout=10)
            assert outcome.returncode != 0, (first, outcome.stdout)
            expected = 'cancelled' if first == 'cancel' else 'preparing'
            assert sql(f"select status from public.orders where id='{order}'").stdout.strip() == expected
    print('PASS: two-staff retries create one event, stale stages rejected, cancellation/preparation lock races')
finally:
    sql(f"delete from public.orders where id='{order}';delete from auth.users where id in ('{owner}','{staff}','{other_staff}');")

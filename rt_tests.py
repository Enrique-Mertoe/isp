import routeros_api as router

# pool = router.connect(
#     host='192.168.88.1',
#     password='12345_-',
#     username='admin'
# ).login()

conn = router.RouterOsApiPool(host='192.168.88.1',
                              password='12345_-',
                              username='admin',
                              plaintext_login=True)
api = conn.get_api()
# ip_addresses = api.get_resource('ip/address').get()
# qry = api.get_resource("ppp/profile").add(name='ido',bridge_path_cost='300')
qry = api.get_resource("system").call("reboot")
# for ip in ip_addresses:
#     print(ip)

# connection.disconnect()

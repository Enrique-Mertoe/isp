from intasend import APIService

publishable_key = "ISPubKey_test_bf9cd546-8017-4af8-bf73-3e754887d3ff"
service = APIService(token="ISSecretKey_test_0b3dce15-b552-4492-8777-80cb83fdcfab", publishable_key=publishable_key, test=True)

response = service.collect.checkout(phone_number=25411376536,
                                    email="brianndesa262@gmail.com", amount=10, currency="KES", comment="Service Fees", redirect_url="http://example.com/thank-you")
print(response.get("url"))

print(response.get("url"))  # Redirect user here for payment

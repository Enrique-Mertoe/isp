def user_page(request):
    return render(request, 'index.html')


def user_list(request):
    if request.method == "POST":
        load_type = request.POST.get("load_type", "all")
        # search = request.data.get("search", "")
        #
        # if search:
        #     routers = routers.filter(
        #         Q(name__icontains=search) | Q(ip_address__icontains=search)
        #     )

        if load_type in ["hotspot", "pppoe"]:
            routers = User.objects.filter(type=load_type)
        else:
            routers = User.objects.all()

        users_data = [user_to_dict(router) for router in routers]

        # Always calculate total counts
        all_count = User.objects.count()
        h_count = User.objects.filter(type="hotspot").count()
        p_count = User.objects.filter(type="pppoe").count()

        return JsonResponse({
            "users": users_data,
            "all_count": all_count,
            "pppoe_count": p_count,
            "hotspot_count": h_count,
        }, safe=False)


@csrf_exempt
def user_create(request):
    if request.method == "POST":
        try:
            data = request.POST
            print(data)
            user = User.objects.create(
                name=data.get('name'),
                type=data.get('type'),
                upload_speed=data.get('upload_speed'),
                download_speed=data.get('download_speed'),
                price=data.get('price'),
                router=Router.objects.get(id=data.get('router'))
            )
            return JsonResponse(user_to_dict(user), status=201)
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def user_detail(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "GET":
        return JsonResponse(router_to_dict(router))
    return HttpResponseBadRequest()


@csrf_exempt
def user_update(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "PUT" or request.method == "PATCH":
        try:
            data = request.POST
            router.name = data.get('name', router.name)
            router.password = data.get('password', router.password)
            router.location = data.get('location', router.location)
            router.ip_address = data.get('ip_address', router.ip_address)
            router.save()
            return JsonResponse(router_to_dict(router))
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def user_delete(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "DELETE":
        router.delete()
        return JsonResponse({'message': 'Router deleted successfully.'})
    return HttpResponseBadRequest()

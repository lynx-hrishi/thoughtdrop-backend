import 'dart:io';

import 'package:currency_converter/models/user_model.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';

class HttpService{
  static final HttpService _instance = HttpService._internal();
  late Dio dio;
  bool _initialized = false;

  factory HttpService() => _instance;

  HttpService._internal();

  Future<void> init() async {
    if (_initialized) return;

    final dir = await getApplicationDocumentsDirectory();

    final cookieJar = PersistCookieJar(
      storage: FileStorage('${dir.path}/.cookies/'),
      ignoreExpires: false
    );

    dio = Dio(
      BaseOptions(
        baseUrl: "https://arranged-communities-pdt-snake.trycloudflare.com",
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json'
        }
      )
    );

    dio.interceptors.add(CookieManager(cookieJar));

    dio.interceptors.add(
      LogInterceptor(
        // request: true,
        requestUrl: true,
        // requestHeader: true,
        // responseHeader: true
      )
    );

    _initialized = true;
  }

  Future<Response> loginUser({ required String email }) async {
    return dio.post("/api/auth/login", data: {
      "email": email
    });
  }

  Future<Response> otpVerify({ required String email, required int otp }) async {
    return dio.post("/api/auth/verify", data: {
      "email": email,
      "otp": otp
    });
  }
  
  Future<List<UserModel>> getMatchesForUsers({ int page=1, int limit=10 } ) async {
    final Response res = await dio.get("/api/match/matches?page=$page&limit=$limit");
    
    List matches = res.data['data']['matches'];
    List<UserModel> users = [];
    
    for (var user in matches){
      print(user);
      String profileImage = user['profileImageUrl'];
      List postImages = user['postImageUrl'];

      List<String> userImages = [profileImage];
      
      for (var img in postImages){
        userImages.add(img.toString());
      }

      UserModel newUser = UserModel(
        id: user['_id'], 
        email: user['email'], 
        name: user['name'], 
        gender: user['gender'], 
        dateOfBirth: user['dateOfBirth'], 
        zodiacSign: user['zodiacSign'], 
        profession: user['profession'], 
        interests: List<String>.from(user['interests']), 
        images: userImages,
        partnerPreference: user['partnerPreference'],
        age: user['age']
      );

      users.add(newUser);
    }
    return users;
  }

  Future<UserModel> getUserDetails() async {
    final Response res = await dio.get("/api/user/get-user-details");
    
    var user = res.data['data'];
    String profileImage = user['profileImageUrl'];
    List postImages = user['postImageUrl'];

    List<String> userImages = [profileImage];
    
    for (var img in postImages){
      userImages.add(img.toString());
    }

    return UserModel(
      id: user['_id'], 
      email: user['email'], 
      name: user['name'], 
      gender: user['gender'], 
      dateOfBirth: user['dateOfBirth'], 
      zodiacSign: user['zodiacSign'], 
      profession: user['profession'], 
      interests: List<String>.from(user['interests']), 
      images: userImages,
      partnerPreference: user['partnerPreference'],
      age: user['age']
    );
  }

  Future<bool> checkSession() async {
    try {
      await dio.get("/api/user/get-user-details");
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    final dir = await getApplicationDocumentsDirectory();
    final cookieJar = PersistCookieJar(storage: FileStorage('${dir.path}/.cookies/'));
    await cookieJar.deleteAll();
  }

  Future<bool> likeUserService(String toUser) async {
    final Response res = await dio.post("/api/match/like-user", data: {
      "toUser": toUser
    });

    bool hasMatched = res.data['data']['matchStatus'];
    return hasMatched;
  }

  Future<Response> passUserService(String toUser) async {
    return await dio.post("/api/match/pass-user", data: {
      "toUser": toUser
    });
  }

  Future<List> getMatchedUsersService() async {
    final Response res = await dio.get("/api/match/get-matched-users");
    List matchedUsers = res.data['data'];
    return matchedUsers;
  }

  Future<Response> updateProfile({
    String? gender,
    String? profession,
    List<String>? interests,
    String? partnerGender,
    String? partnerPreference,
    int? ageFrom,
    int? ageEnd,
    File? profileImage,
    List<File>? postImages
  }) async {
    FormData formData = FormData();
    
    if (gender != null) formData.fields.add(MapEntry('gender', gender));
    if (profession != null) formData.fields.add(MapEntry('profession', profession));
    if (interests != null) {
      for (var interest in interests) {
        formData.fields.add(MapEntry('interests', interest));
      }
    }
    if (partnerGender != null) formData.fields.add(MapEntry('partnerGender', partnerGender));
    if (partnerPreference != null) formData.fields.add(MapEntry('partnerPreference', partnerPreference));
    if (ageFrom != null) formData.fields.add(MapEntry('ageFrom', ageFrom.toString()));
    if (ageEnd != null) formData.fields.add(MapEntry('ageEnd', ageEnd.toString()));
    
    if (profileImage != null) {
      formData.files.add(MapEntry(
        'profileImage',
        await MultipartFile.fromFile(profileImage.path, filename: profileImage.path.split('/').last)
      ));
    }
    
    if (postImages != null) {
      for (var image in postImages) {
        formData.files.add(MapEntry(
          'postImages',
          await MultipartFile.fromFile(image.path, filename: image.path.split('/').last)
        ));
      }
    }
    
    return await dio.put("/api/user/update-profile", data: formData);
  }

  
}
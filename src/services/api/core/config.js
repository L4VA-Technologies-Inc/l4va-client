export class CoreConfigProvider {
  static login() {
    return '/api/v1/auth/login';
  }

  static getProfile() {
    return '/api/v1/auth/profile';
  }

  static uploadImage() {
    return '/api/v1/upload';
  }
}

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

/// Usuário logado, salvo no navegador (como o `localStorage` do React).
class Session extends ChangeNotifier {
  static const _chave = 'user';

  User? _user;
  User? get user => _user;
  bool get isLogged => _user != null;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final salvo = prefs.getString(_chave);
    if (salvo != null) {
      try {
        _user = User.fromJson(jsonDecode(salvo) as Map<String, dynamic>);
      } catch (_) {
        await prefs.remove(_chave);
      }
    }
    notifyListeners();
  }

  Future<void> setUser(User user) async {
    _user = user;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_chave, jsonEncode(user.toJson()));
  }

  Future<void> logout() async {
    _user = null;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_chave);
  }
}

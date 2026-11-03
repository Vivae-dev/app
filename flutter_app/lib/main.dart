import 'package:flutter/material.dart';

import 'globals.dart';
import 'screens/catalog_screen.dart';
import 'ui.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await session.load();
  runApp(const VivaeApp());
}

class VivaeApp extends StatelessWidget {
  const VivaeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vivae',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      scaffoldMessengerKey: messengerKey,
      home: const CatalogScreen(),
    );
  }
}

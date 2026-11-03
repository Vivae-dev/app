import 'package:flutter/material.dart';

/// Cores do front React (App.css).
class AppColors {
  static const bgTop = Color(0xFF0F172A);
  static const bgBottom = Color(0xFF1E1B4B);
  static const card = Color(0x0DFFFFFF); // branco 5%
  static const cardBorder = Color(0x1AFFFFFF); // branco 10%
  static const text = Color(0xFFF8FAFC);
  static const textSecondary = Color(0xFF94A3B8);
  static const muted = Color(0xFF64748B);
  static const accent = Color(0xFF8B5CF6);
  static const accentHover = Color(0xFFA78BFA);
  static const success = Color(0xFF10B981);
  static const danger = Color(0xFFEF4444);
  static const warning = Color(0xFFD97706);
  static const line = Color(0xFF334155);
  static const ordersBlue = Color(0xFF0891B2);
  static const adminPurple = Color(0xFF7C3AED);
}

ThemeData buildTheme() {
  final base = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.accent,
      brightness: Brightness.dark,
      primary: AppColors.accent,
    ),
    useMaterial3: true,
  );
  return base.copyWith(
    scaffoldBackgroundColor: AppColors.bgTop,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0x0AFFFFFF),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
      hintStyle: const TextStyle(color: AppColors.muted),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.cardBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.accent, width: 2),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: Color(0xFF1E293B),
      contentTextStyle: TextStyle(color: AppColors.text),
    ),
  );
}

/// Mostra mensagens rápidas (os "toasts" do React) de qualquer tela.
final messengerKey = GlobalKey<ScaffoldMessengerState>();

void showToast(String mensagem) {
  messengerKey.currentState
    ?..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(mensagem)));
}

/// Fundo em degradê + conteúdo centralizado com largura máxima.
class PageShell extends StatelessWidget {
  final Widget child;
  final double maxWidth;

  const PageShell({
    super.key,
    required this.child,
    this.maxWidth = 640,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.bgTop, AppColors.bgBottom],
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Align(
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxWidth),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

/// Cartão translúcido, como o `.summary-card` do React.
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: child,
    );
  }
}

/// Imagem externa (URL da caixa) com fallback quando não carrega.
class NetImage extends StatelessWidget {
  final String url;
  final double? width;
  final double? height;
  final BorderRadius borderRadius;

  const NetImage(
    this.url, {
    super.key,
    this.width,
    this.height,
    this.borderRadius = BorderRadius.zero,
  });

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      width: width,
      height: height,
      color: const Color(0x14FFFFFF),
      alignment: Alignment.center,
      child: const Icon(Icons.card_giftcard, color: AppColors.muted, size: 32),
    );
    if (url.isEmpty) {
      return ClipRRect(borderRadius: borderRadius, child: placeholder);
    }
    return ClipRRect(
      borderRadius: borderRadius,
      child: Image.network(
        url,
        width: width,
        height: height,
        fit: BoxFit.cover,
        // Na web, imagens de sites sem CORS só carregam como <img> normal
        webHtmlElementStrategy: WebHtmlElementStrategy.fallback,
        errorBuilder: (_, __, ___) => placeholder,
      ),
    );
  }
}

/// Título de seção, no estilo do React.
class SectionTitle extends StatelessWidget {
  final String text;
  final String? subtitle;

  const SectionTitle(this.text, {super.key, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            text,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle!, style: const TextStyle(color: AppColors.textSecondary)),
          ],
        ],
      ),
    );
  }
}

// ── Formatação ───────────────────────────────────────────────────────────

String formatBRL(num valor) {
  final partes = valor.abs().toStringAsFixed(2).split('.');
  final inteiro = partes[0];
  final buf = StringBuffer();
  for (var i = 0; i < inteiro.length; i++) {
    if (i > 0 && (inteiro.length - i) % 3 == 0) buf.write('.');
    buf.write(inteiro[i]);
  }
  return '${valor < 0 ? '-' : ''}R\$ $buf,${partes[1]}';
}

String formatDate(String iso) {
  final d = DateTime.tryParse(iso)?.toLocal();
  if (d == null) return '';
  String dois(int n) => n.toString().padLeft(2, '0');
  return '${dois(d.day)}/${dois(d.month)}/${d.year}';
}

/// Confirmação simples (o `window.confirm` do React).
Future<bool> confirmar(BuildContext context, String pergunta) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      content: Text(pergunta),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Não'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text('Sim'),
        ),
      ],
    ),
  );
  return ok ?? false;
}

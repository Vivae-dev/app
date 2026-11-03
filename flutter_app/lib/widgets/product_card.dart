import 'package:flutter/material.dart';

import '../models.dart';
import '../ui.dart';

/// Cartão de uma caixa na vitrine (o `ProductCard` do React).
class ProductCard extends StatelessWidget {
  final Box box;
  final VoidCallback onBuy;

  const ProductCard({super.key, required this.box, required this.onBuy});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          NetImage(
            box.image,
            height: 180,
            width: double.infinity,
            borderRadius: BorderRadius.circular(12),
          ),
          const SizedBox(height: 14),
          Text(
            box.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 6),
          Expanded(
            child: Text(
              '${box.isSubscription ? '📦 Assinatura' : '🛍️ Avulsa'} - '
              '${box.description}',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: formatBRL(box.price),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accentHover,
                  ),
                ),
                if (box.isSubscription)
                  const TextSpan(
                    text: ' / mês',
                    style: TextStyle(
                      fontSize: 15,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onBuy,
              child: Text(box.isSubscription ? 'Assinar Agora' : 'Comprar Avulsa'),
            ),
          ),
        ],
      ),
    );
  }
}

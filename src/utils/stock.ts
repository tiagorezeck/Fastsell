"use client";

import { Product, StockBatch } from '../types';

/**
 * Calcula a quantidade máxima que pode ser produzida de um item
 * baseado no estoque atual de seus insumos.
 */
export const calculatePotentialStock = (product: Product, allProducts: Product[]): number => {
  // Se não for um produto produzido ou não tiver receita, retorna o estoque total (soma dos lotes)
  if (product.type !== 'Produzido' || !product.recipe || product.recipe.length === 0) {
    return product.batches?.reduce((acc, b) => acc + b.quantity, 0) || product.stock || 0;
  }

  // Calcula o potencial de cada ingrediente
  const potentials = product.recipe.map(item => {
    const ingredient = allProducts.find(p => p.id === item.productId);
    if (!ingredient) return 0;
    
    const ingredientStock = ingredient.batches?.reduce((acc, b) => acc + b.quantity, 0) || ingredient.stock || 0;
    if (ingredientStock <= 0) return 0;
    
    return Math.floor(ingredientStock / item.netQuantity);
  });

  return Math.min(...potentials);
};

/**
 * Deduz estoque usando a regra FIFO (First-In, First-Out)
 */
export const deductFIFO = (batches: StockBatch[], quantityToDeduct: number): { updatedBatches: StockBatch[], deductedQuantity: number } => {
  if (!batches || batches.length === 0) return { updatedBatches: [], deductedQuantity: 0 };

  // Ordena por data de entrada (mais antigo primeiro)
  const sortedBatches = [...batches].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
  
  let remainingToDeduct = quantityToDeduct;
  const updatedBatches = sortedBatches.map(batch => {
    if (remainingToDeduct <= 0) return batch;

    const amountFromThisBatch = Math.min(batch.quantity, remainingToDeduct);
    remainingToDeduct -= amountFromThisBatch;

    return {
      ...batch,
      quantity: batch.quantity - amountFromThisBatch
    };
  }).filter(batch => batch.quantity > 0); // Remove lotes zerados

  return {
    updatedBatches,
    deductedQuantity: quantityToDeduct - remainingToDeduct
  };
};
"use client";

export interface ExternalProductInfo {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  source: string;
}

export class ExternalLookupService {
  private async tryOpenFacts(code: string, type: 'food' | 'beauty' | 'pet' | 'products'): Promise<ExternalProductInfo | null> {
    const domains = {
      food: 'world.openfoodfacts.org',
      beauty: 'world.openbeautyfacts.org',
      pet: 'world.openpetfoodfacts.org',
      products: 'world.openproductsfacts.org'
    };
    const sources = {
      food: 'Open Food Facts',
      beauty: 'Open Beauty Facts',
      pet: 'Open Pet Food Facts',
      products: 'Open Products Facts'
    };

    try {
      const res = await fetch(`https://${domains[type]}/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        return {
          name: p.product_name || p.product_name_pt || p.product_name_en || '',
          description: p.generic_name || p.brands || '',
          category: p.categories?.split(",")[0]?.trim() || 'Outros',
          imageUrl: p.image_front_url || p.image_url || '',
          source: sources[type]
        };
      }
    } catch (e) { return null; }
    return null;
  }

  private async tryOpenLibrary(code: string): Promise<ExternalProductInfo | null> {
    try {
      const res = await fetch(`https://openlibrary.org/isbn/${code}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        name: data.title,
        description: `Autor: ${data.authors?.map((a: any) => a.key).join(', ') || 'N/A'} | Editora: ${data.publishers?.join(', ') || 'N/A'}`,
        category: 'Livros',
        imageUrl: data.covers ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` : '',
        source: 'Open Library'
      };
    } catch (e) { return null; }
  }

  private async tryUPCitemdb(code: string): Promise<ExternalProductInfo | null> {
    try {
      const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        return {
          name: item.title,
          description: item.description || item.brand,
          category: item.category || 'Geral',
          imageUrl: item.images?.[0] || '',
          source: 'UPCitemdb'
        };
      }
    } catch (e) { return null; }
    return null;
  }

  async lookup(code: string): Promise<ExternalProductInfo | null> {
    if (code.startsWith('978') || code.startsWith('979')) {
      const book = await this.tryOpenLibrary(code);
      if (book) return book;
    }

    const results = [
      await this.tryOpenFacts(code, 'food'),
      await this.tryOpenFacts(code, 'beauty'),
      await this.tryOpenFacts(code, 'pet'),
      await this.tryOpenFacts(code, 'products'),
      await this.tryUPCitemdb(code)
    ];

    return results.find(r => r !== null) || null;
  }
}
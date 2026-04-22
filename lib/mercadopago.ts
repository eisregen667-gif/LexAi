import { Product } from '../types';

export const createPreference = async (
  items: Product[], 
  payerInfo: { 
    name: string; 
    email: string; 
    cpf: string; 
    phone?: string;
    address?: string;
  },
  paymentMethod: 'pix' | 'card'
) => {
  try {
    const url = '/api/create-preference';

    const body = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || 'Produto',
        picture_url: item.image_url,
        category_id: item.category,
        quantity: item.quantity,
        unit_price: Number(item.price)
      })),
      payer: {
        name: payerInfo.name,
        email: payerInfo.email,
        cpf: payerInfo.cpf,
        phone: payerInfo.phone, 
        address: payerInfo.address
      },
      paymentMethod // Envia se é pix ou card
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor.');
    }

    const data = await response.json();
    return {
        id: data.id,
        init_point: data.init_point, 
        orderId: data.orderId 
    };

  } catch (error) {
    console.error('Error creating preference:', error);
    throw error;
  }
};

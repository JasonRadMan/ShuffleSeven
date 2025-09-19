export interface Card {
  category: string;
  image: string;
  message: string;
  title?: string;
}

export async function loadCards(): Promise<Card[]> {
  try {
    const response = await fetch('/api/cards');
    if (!response.ok) {
      throw new Error('Failed to load cards');
    }
    const data = await response.json();
    return data.cards || [];
  } catch (error) {
    console.error('Error loading cards:', error);
    // Return empty array if cards can't be loaded
    return [];
  }
}

export async function loadLifelineCards(): Promise<Card[]> {
  try {
    const response = await fetch('/api/cards/lifeline');
    if (!response.ok) {
      throw new Error('Failed to load lifeline cards');
    }
    const data = await response.json();
    return data.cards || [];
  } catch (error) {
    console.error('Error loading lifeline cards:', error);
    // Return empty array if lifeline cards can't be loaded
    return [];
  }
}

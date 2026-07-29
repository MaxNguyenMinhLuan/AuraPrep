import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

export async function addSpecialAuramons() {
  try {
    const addAuramons = httpsCallable(functions, 'addSpecialAuramons');
    const result = await addAuramons({});
    return result.data;
  } catch (error: any) {
    console.error('Error adding special Auramons:', error);
    throw error;
  }
}

export async function redeemGiftCode(code: string) {
  try {
    const redeem = httpsCallable(functions, 'redeemGiftCode');
    const result = await redeem({ code });
    return result.data;
  } catch (error: any) {
    console.error('Error redeeming gift code:', error);
    throw error;
  }
}

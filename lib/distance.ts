export const ONGKIR = 1000; // ongkir 1 kilo per KM

export function hitungJarak(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2)); // Mengembalikan jarak dalam kilometer dengan 2 desimal
}

export function hitungOngkir(jarakKM: number, beratKG: number): number {
    const weight = beratKG && beratKG > 0 ? beratKG : 1; // berat minimal 1 kg

    let cost;

    if (weight > 10) {
        cost = Math.round(jarakKM * ONGKIR * ( weight / 50))
    } else {
        cost = Math.round(jarakKM * ONGKIR)
    }

    return cost; // Ongkir dihitung berdasarkan jarak dan berat
}

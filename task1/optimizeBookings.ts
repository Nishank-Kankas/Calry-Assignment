function optimizeBookings(bookings: number[][]): number[][] {
    if (!bookings || bookings.length === 0) {
        return [];
    }

    bookings.sort((a, b) => a[0] - b[0]);

    const merged: number[][] = [];
    let current = bookings[0];

    for (let i = 1; i < bookings.length; i++) {
        const next = bookings[i];
        if (current[1] >= next[0]) {
            current[1] = Math.max(current[1], next[1]);
        } else {
            merged.push(current);
            current = next;
        }
    }
    merged.push(current);
    return merged;
}

const bookings = [[9, 12], [11, 13], [14, 17], [16, 18]];
const optimized = optimizeBookings(bookings);
console.log(optimized); 

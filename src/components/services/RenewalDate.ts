const renewalDate = (dateString: string, cycle: string) => {
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const lastDate = new Date(year, month, day);

    if (isNaN(lastDate.getTime())) {
        return "Invalid Date";
    }

    switch (cycle.toLowerCase()) {
        case 'weekly':
            lastDate.setDate(lastDate.getDate() + 7);
            break;
        case 'monthly':
            lastDate.setDate(lastDate.getDate() + 30);
            break;
        case 'yearly':
            lastDate.setFullYear(lastDate.getFullYear() + 1);
            break;
        default:
            lastDate.setDate(lastDate.getDate() + 30);
    }

    const pad = (num: number) => num.toString().padStart(2, '0');

    const resYear = lastDate.getFullYear();
    const resMonth = pad(lastDate.getMonth() + 1);
    const resDay = pad(lastDate.getDate());

    return `${resYear}-${resMonth}-${resDay}`;
};

export default renewalDate;
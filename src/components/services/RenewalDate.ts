const renewalDate = (date: string, cycle: string) => {
    const lastDate = new Date(date);
    if(isNaN(lastDate.getTime())) {
        return "Invalid Date"
    }

    switch (cycle) {
        case 'weekly': 
        lastDate.setDate(lastDate.getDate()+7);
        break;
        case 'monthly': 
        lastDate.setMonth(lastDate.getMonth()+1);
        break;
        case 'yearly': 
        lastDate.setFullYear(lastDate.getFullYear()+1);
        break;
        default:
            lastDate.setMonth(lastDate.getMonth()+1);
    }
    return lastDate.toISOString().split('T')[0];

};

export default renewalDate;
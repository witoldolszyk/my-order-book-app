export interface Level {
    price: number;
    size: number;
}

export interface RawSnapshot {
    Time: string;
    Bid1: number;
    Bid1Size: number;
    Bid2: number;
    Bid2Size: number;
    Bid3: number;
    Bid3Size: number;
    Bid4: number;
    Bid4Size: number;
    Bid5: number;
    Bid5Size: number;
    Bid6: number;
    Bid6Size: number;
    Bid7: number;
    Bid7Size: number;
    Bid8: number;
    Bid8Size: number;
    Bid9: number;
    Bid9Size: number;
    Bid10: number;
    Bid10Size: number;

    Ask1: number;
    Ask1Size: number;
    Ask2: number;
    Ask2Size: number;
    Ask3: number;
    Ask3Size: number;
    Ask4: number;
    Ask4Size: number;
    Ask5: number;
    Ask5Size: number;
    Ask6: number;
    Ask6Size: number;
    Ask7: number;
    Ask7Size: number;
    Ask8: number;
    Ask8Size: number;
    Ask9: number;
    Ask9Size: number;
    Ask10: number;
    Ask10Size: number;
}

export interface Snapshot {
    timestamp: number;
    timeText: string;
    bids: Level[];
    asks: Level[];
}



class TrackPiece {

    constructor(
        type,
        x,
        y,
        length
    ) {
        this.type = type
        this.x = x,
            this.y = y
        this.length = length
    }

    draw() {
        switch (this.type) {
            case 'Hstraight':
                push()
                noStroke(0)
                rect(this.x, this.y, this.length, 100)
                stroke(1)
                line(this.x, this.y, this.x + this.length, this.y)
                line(this.x, this.y + 100, this.x + this.length, this.y + 100)
                pop()
                return;
            case 'Vstraight':
                push()
                noStroke(0)
                rect(this.x, this.y, 100, this.length)
                stroke(1)
                line(this.x, this.y, this.x, this.y + this.length)
                line(this.x + 100, this.y, this.x + 100, this.y + this.length)
                pop()
                return;
            case 'tight-curve':
                push()
                arc(this.x, this.y, 200, 200, 0 + this.length, HALF_PI + this.length);
                pop()
                return;
            case 'curve':
                push()
                fill('white')
                arc(this.x - 100, this.y, 400, 400, 0 + this.length, HALF_PI + this.length);
                fill(220)
                arc(this.x - 100, this.y, 200, 200, 0 + this.length, HALF_PI + this.length);
                fill('white')
                pop()
                return;
        }
    }
}

class Track {

    constructor(
        trackValues
    ) {
        this.trackValues = trackValues
    }

    draw() {
        for (let trackPiece of this.trackValues) {
            fill('white')
            trackPiece.draw()
        }
    }

    // Returns the trackpiece which the car is currently in
    // if not in a trackpiece then off track
    inTrack(x, y) {
        return this.trackValues.findIndex(
            trackPiece => {
                switch (trackPiece.type) {
                    case 'Hstraight': {
                        if (trackPiece.x < x && x < trackPiece.x + trackPiece.length && trackPiece.y < y && y < trackPiece.y + 100) {
                            return true;
                        }
                        return false;
                    }
                    case 'Vstraight': {
                        if (trackPiece.x < x && x < trackPiece.x + 100 && trackPiece.y < y && y < trackPiece.y + trackPiece.length) {
                            return true;
                        }
                        return false;
                    }
                    case 'tight-curve': {
                        const r = 100;
                        const dx = x - trackPiece.x;
                        const dy = y - trackPiece.y;
                        if (dx * dx + dy * dy > r * r) return false;

                        let a = Math.atan2(dy, dx);
                        if (a < 0) a += TWO_PI;

                        let start = trackPiece.length % TWO_PI;
                        let end = (trackPiece.length + HALF_PI) % TWO_PI;

                        // Normalize end to always be "after" start
                        if (end < start) end += TWO_PI;
                        if (a < start) a += TWO_PI;

                        return a >= start && a <= end;
                    }
                    case 'curve': {
                        const outerR = 200;
                        const innerR = 100;
                      
                        const cx = trackPiece.x - 100;
                        const cy = trackPiece.y;
                      
                        const dx = x - cx;
                        const dy = y - cy;
                        const dist2 = dx * dx + dy * dy;
                      
                        if (dist2 > outerR * outerR || dist2 < innerR * innerR) return false;
                      
                        let a = Math.atan2(dy, dx);
                        if (a < 0) a += TWO_PI;
                      
                        let start = trackPiece.length % TWO_PI;
                        let end = (trackPiece.length + HALF_PI) % TWO_PI;
                      
                        if (end < start) end += TWO_PI;
                        if (a < start) a += TWO_PI;
                      
                        return a >= start && a <= end;
                    }
                    default:
                        return false;
                }
            }
        )
    }
}
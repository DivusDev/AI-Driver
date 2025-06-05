
const visionSize = 100

class Car {

    constructor(x, y, showVisionLines) {
        this.x = x
        this.y = y
        this.velx = 0
        this.vely = 0
        this.speed = 0
        this.rotate = 0
        this.width = 20
        this.height = 30
        this.VMax = 5
        this.showVisionLines = showVisionLines

        this.forwardWall = 2 *visionSize
        this.leftWall = visionSize
        this.rightWall = visionSize
        this.backWall = visionSize
    }

    showV2() {
        stroke(0)
        push()
        // move canvas to car position
        translate(this.x + (this.height / 2), this.y + (this.width / 2))
        rotate( HALF_PI * 3 + this.rotate)
        // draw car
        rect(this.width / -2, this.height / -2, this.width, this.height)

        // draw vision
        if (this.showVisionLines) {
            fill('black')
            line(0,0, visionSize,visionSize)
            rect(this.leftWall, this.leftWall, 5, 5);
            line(0,0,0,2 * visionSize)
            rect(0, this.forwardWall, 5, 5);
            rect(-this.rightWall, this.rightWall, 5, 5);
            line(0,0,-visionSize,visionSize)
            rect( 0, -this.backWall, 5, 5);
            line(0,0, 0,-visionSize)
        }
        pop()
    }

    driveV2() {
        this.x += this.speed * cos(this.rotate)
        this.y += this.speed * sin(this.rotate)
    }

    accelerateV2(acceleration, rotation) {

        const accelFactor = this.logisticResponse(acceleration);
        const accel = acceleration * accelFactor;
        this.speed += accel
        this.speed = this.speed > 0 ? Math.min(this.speed, this.VMax) : -Math.min(this.speed, 0);
        this.rotate = this.rotate - rotation * 0.1
    }

    logisticResponse(v) {
        // This returns a diminishing acceleration factor as speed increases
        return 1 / (1 + Math.exp(-10 * this.VMax / 2 - v));
        // inflection around Vmax/2
    }

    // checkWalls(track) {
    //     if (track == null) {
    //         return 50
    //     }
    //     let visionPoints = [
    //         [ // Left wall
    //         this.x , this.y, this.x + cos(this.rotate - QUARTER_PI) * visionSize, this.y + sin(this.rotate- QUARTER_PI)* visionSize
    //     ],
    //     [ // Forward wall
    //         this.x , this.y, this.x + cos(this.rotate)* 2 *visionSize, this.y + sin(this.rotate)* 2*  visionSize
    //     ],
    //     [ // Right wall
    //         this.x , this.y, this.x + cos(this.rotate + QUARTER_PI)* visionSize, this.y + sin(this.rotate + QUARTER_PI)* visionSize
    //     ],
    //     [ // Back wall
    //         this.x , this.y, this.x + cos(this.rotate + PI)* visionSize, this.y + sin(this.rotate + PI)* visionSize
    //     ]]
    //     let trackSides = []
    //     if (track.type === 'Hstraight') {
    //          trackSides = [[track.x, track.y, track.x + track.length, track.y],[track.x, track.y + 100, track.x + track.length, track.y + 100]]
    //     }
    //     if (track.type === 'Vstraight') {
    //         trackSides = [[track.x, track.y, track.x, track.y  + track.length],[track.x + 100, track.y, track.x + 100, track.y  + track.length]]
    //     }
    //     let newVisionPoints = visionPoints.map( points => Math.min( ...trackSides.map( sides => this.intersectionLength
    //         (
    //             points[0],
    //             points[1],
    //             points[2],
    //             points[3],
    //             sides[0],
    //             sides[1],
    //             sides[2],
    //             sides[3],
    //         ))))
    //         this.leftWall = newVisionPoints[0]
    //         this.forwardWall= newVisionPoints[1]
    //         this.rightWall= newVisionPoints[2]
    //         this.backWall= newVisionPoints[3]
    // }

    checkWalls(track) {
        if (track == null) return visionSize;
    
        const visionPoints = [
            [this.x, this.y, this.x + cos(this.rotate - QUARTER_PI) * visionSize, this.y + sin(this.rotate - QUARTER_PI) * visionSize],
            [this.x, this.y, this.x + cos(this.rotate) * 2 * visionSize, this.y + sin(this.rotate) * 2 * visionSize],
            [this.x, this.y, this.x + cos(this.rotate + QUARTER_PI) * visionSize, this.y + sin(this.rotate + QUARTER_PI) * visionSize],
            [this.x, this.y, this.x + cos(this.rotate + PI) * visionSize, this.y + sin(this.rotate + PI) * visionSize]
        ];
    
        let newVisionPoints = [];
    
        if (track.type === 'Hstraight' || track.type === 'Vstraight') {
            const trackSides = track.type === 'Hstraight' ? [
                [track.x, track.y, track.x + track.length, track.y],
                [track.x, track.y + 100, track.x + track.length, track.y + 100]
            ] : [
                [track.x, track.y, track.x, track.y + track.length],
                [track.x + 100, track.y, track.x + 100, track.y + track.length]
            ];
    
            newVisionPoints = visionPoints.map(points => Math.min(
                ...trackSides.map(sides => this.intersectionLength(
                    points[0], points[1], points[2], points[3],
                    sides[0], sides[1], sides[2], sides[3]
                ))
            ));
        } else 
        if (track.type === 'tight-curve') {
            const cx = track.x;
            const cy = track.y;
            const startAngle = (track.length + TWO_PI) % TWO_PI;
            const endAngle = (track.length + HALF_PI + TWO_PI) % TWO_PI;
            const r = 100; // radius is 100 for tight-curve (since arc drawn with diameter 200)
    
            newVisionPoints = visionPoints.map(([x1, y1, x2, y2]) => {
                const SEx = x2 - x1;
                const SEy = y2 - y1;
                const CSx = x1 - cx;
                const CSy = y1 - cy;
    
                const a = SEx * SEx + SEy * SEy;
                const b = 2 * (SEx * CSx + SEy * CSy);
                const c = CSx * CSx + CSy * CSy - r * r;
    
                const discriminant = b * b - 4 * a * c;
                if (discriminant < 0) return Math.hypot(SEx, SEy);
    
                const sqrtD = Math.sqrt(discriminant);
                const t1 = (-b - sqrtD) / (2 * a);
                const t2 = (-b + sqrtD) / (2 * a);
    
                const validTs = [t1, t2].filter(t => t > 0 && t < 1);
                for (const t of validTs) {
                    const ix = x1 + t * SEx;
                    const iy = y1 + t * SEy;
                    const angle = (Math.atan2(iy - cy, ix - cx) + TWO_PI) % TWO_PI;
    
                    const withinArc = startAngle < endAngle
                        ? angle >= startAngle && angle <= endAngle
                        : angle >= startAngle || angle <= endAngle;
    
                    if (withinArc) {
                        return Math.hypot(SEx, SEy) * t;
                    }
                }
    
                return Math.hypot(SEx, SEy);
            });
        }
        if (track.type === 'curve') {
            const cx = track.x - 100;  // Center shifted left by 100 as per your arc drawing
            const cy = track.y;
            const startAngle = (track.length + TWO_PI) % TWO_PI;
            const endAngle = (track.length + HALF_PI + TWO_PI) % TWO_PI;
            const outerRadius = 200;  // Outer arc radius
            const innerRadius = 100;  // Inner arc radius (the hollow part)
    
            newVisionPoints = visionPoints.map(([x1, y1, x2, y2]) => {
                const SEx = x2 - x1;
                const SEy = y2 - y1;
                const CSx = x1 - cx;
                const CSy = y1 - cy;
    
                const a = SEx * SEx + SEy * SEy;
                const b = 2 * (SEx * CSx + SEy * CSy);
                const cOuter = CSx * CSx + CSy * CSy - outerRadius * outerRadius;
                const cInner = CSx * CSx + CSy * CSy - innerRadius * innerRadius;
    
                // Solve quadratic for outer radius
                const discOuter = b * b - 4 * a * cOuter;
                // Solve quadratic for inner radius
                const discInner = b * b - 4 * a * cInner;
    
                if (discOuter < 0) return Math.hypot(SEx, SEy);  // No intersection with outer circle, so no hit
    
                const sqrtOuter = Math.sqrt(discOuter);
                const tOuter1 = (-b - sqrtOuter) / (2 * a);
                const tOuter2 = (-b + sqrtOuter) / (2 * a);
    
                // Collect all valid t values that lie between 0 and 1 for outer circle
                const validOuterTs = [tOuter1, tOuter2].filter(t => t >= 0 && t <= 1);
    
                // Similarly for inner circle (hole), but we want to ignore intersections inside inner circle
                let validInnerTs = [];
                if (discInner >= 0) {
                    const sqrtInner = Math.sqrt(discInner);
                    const tInner1 = (-b - sqrtInner) / (2 * a);
                    const tInner2 = (-b + sqrtInner) / (2 * a);
                    validInnerTs = [tInner1, tInner2].filter(t => t >= 0 && t <= 1);
                }
    
                // Filter outer intersections to only those not inside inner radius arc region
                // (i.e. between inner and outer circle)
                const candidates = [];
    
                for (const t of validOuterTs) {
                    const ix = x1 + t * SEx;
                    const iy = y1 + t * SEy;
                    const distFromCenter = Math.hypot(ix - cx, iy - cy);
                    const angle = (Math.atan2(iy - cy, ix - cx) + TWO_PI) % TWO_PI;
    
                    const withinArc = startAngle < endAngle
                        ? angle >= startAngle && angle <= endAngle
                        : angle >= startAngle || angle <= endAngle;
    
                    // Only accept points within arc segment and between inner and outer radius
                    if (withinArc && distFromCenter <= outerRadius && distFromCenter >= innerRadius) {
                        candidates.push({ t, dist: Math.hypot(SEx, SEy) * t });
                    }
                }
    
                if (candidates.length === 0) return Math.hypot(SEx, SEy);
    
                // Return the minimum distance (closest intersection)
                return candidates.reduce((min, c) => c.dist < min ? c.dist : min, candidates[0].dist);
            });
        }

        this.leftWall = newVisionPoints[0] ?? visionSize;
        this.forwardWall = newVisionPoints[1] ?? visionSize;
        this.rightWall = newVisionPoints[2] ?? visionSize;
        this.backWall = newVisionPoints[3] ?? visionSize;
    }

     intersectionLength(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const dx1 = ax2 - ax1;
        const dy1 = ay2 - ay1;
        const dx2 = bx2 - bx1;
        const dy2 = by2 - by1;
      
        const denominator = dx1 * dy2 - dy1 * dx2;
        if (denominator === 0) {
          // Lines are parallel or collinear
          const fullLength = Math.hypot(dx1, dy1);
          return fullLength;
        }
      
        const ua = ((bx1 - ax1) * dy2 - (by1 - ay1) * dx2) / denominator;
        const ub = ((bx1 - ax1) * dy1 - (by1 - ay1) * dx1) / denominator;
      
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          // No intersection within segment bounds
          const fullLength = Math.hypot(dx1, dy1);
          return fullLength;
        }
      
        // Intersection happens at distance along line A
        const intersectX = ax1 + ua * dx1;
        const intersectY = ay1 + ua * dy1;
        const dist = Math.hypot(intersectX - ax1, intersectY - ay1);
        return dist;
      }
      


}
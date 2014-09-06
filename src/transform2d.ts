//---------------------------------
interface XY {
    x: number;
    y: number;
}

class Transform2D {
    angle: number = 0;
    sx: number = 1;
    sy: number = 1;
    tx: number = 0;
    ty: number = 0;

    copy(other: Transform2D): Transform2D {
        this.angle = other.angle;
        this.sx = other.sx;
        this.sy = other.sy;
        this.tx = other.tx;
        this.ty = other.ty;
        return this;
    }

    clone(): Transform2D {
        return new Transform2D().copy(this);
    }

    setTranslate(x: number, y: number): Transform2D {
        this.tx = x;
        this.ty = y;
        return this;
    }

    setScale(sx: number, sy: number): Transform2D {
        this.sx = sx;
        this.sy = sy;
        return this;
    }

    setRotate(angle: number): Transform2D {
        this.angle = angle;
        return this;
    }

    translate(x: number, y: number): Transform2D {
        this.tx += x;
        this.ty += y;
        return this;
    }

    scale(sx: number, sy: number): Transform2D {
        this.sx *= sx;
        this.sy *= sy;
        return this;
    }

    rotate(angle: number): Transform2D {
        this.angle += angle;
        return this;
    }

    multiply(other: Transform2D): Transform2D {
        this.angle += other.angle;
        this.sx *= other.sx;
        this.sy *= other.sy;
        this.tx += other.tx;
        this.ty += other.ty;
        return this;
    }

    inverse(): Transform2D {
        this.angle = -this.angle;
        this.sx = 1 / this.sx;
        this.sy = 1 / this.sy;
        this.tx = -this.tx;
        this.ty = -this.ty;
        return this;
    }

    setIdentity(): Transform2D {
        this.angle = 0;
        this.sx = this.sy = 1;
        this.tx = this.ty = 0;
        return this;
    }

    draw(ctx: CanvasRenderingContext2D) {
        var cos = Math.cos(this.angle);
        var sin = Math.sin(this.angle);
        ctx.transform(cos * this.sx, -sin * this.sy, sin * this.sx, cos * this.sy, this.tx, this.ty);
    }

    getLocal(x: number, y: number): XY {
        return {
            x: (x - this.tx) / this.sx,
            y: (y - this.ty) / this.sy
        };
    }

    getGlobal(lx: number, ly: number): XY {
        return {
            x: lx * this.sx + this.tx,
            y: ly * this.sy + this.ty
        };
    }

    toCSS(): string {
        var cos = Math.cos(this.angle);
        var sin = Math.sin(this.angle);
        return 'transform(' +
            (cos * this.sx).toString() + ',' +
            (-sin * this.sy).toString() + ',' +
            (sin * this.sx).toString() + ',' +
            (cos * this.sy).toString() + ',' +
            this.tx.toString() + ',' +
            this.ty.toString() + ')';
    }
}

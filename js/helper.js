

Array.prototype.rotateRight = function( k ) {
    for (let i = 0; i < k; i++) {
        this.push(this.shift());
    }
  }
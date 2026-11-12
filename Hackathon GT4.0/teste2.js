class AVista {
    constructor(total) { this.total = total }
    pagar() {
        this.status = 'pago'
    }
}

class Parcelado {
    constructor(total, parcelas) { this.total = total; this.parcelas = parcelas }
    pagar() {
        if (this.parcelas > 3) throw new Error('max 3')
        this.status = 'pago'
        this.total = this.total * 1.1
    }
}

class Pix {
    constructor(total) { this.total = total }
    pagar() {
        this.status = 'pago'
        this.total = this.total * 0.95
    }
}

function criarPedido(tipo, total, parcelas) {
    if (tipo === 'avista') return new AVista(total)
    else if (tipo === 'parcelado') return new Parcelado(total, parcelas)
    else if (tipo === 'pix') return new Pix(total)
}




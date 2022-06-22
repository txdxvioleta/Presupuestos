//Variables y selectores:
const formulario = document.querySelector('#agregar-gasto')
const gastoListado = document.querySelector('#gastos ul')
let presupuesto


//Eventos:
function eventListeners() {
  document.addEventListener('DOMContentLoaded', preguntarPresupuesto)
  document.addEventListener('submit', agregarGasto)

}

//Clases:
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto)
    this.restante = Number(presupuesto)
    this.gastos = []
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto]
    this.calcularRestante()
  }

  calcularRestante() {
    const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0)
    this.restante = this.presupuesto - gastado
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter(gasto => gasto.id !== id)
    this.calcularRestante()

  }

}


class UI {
  insertarPresupuesto(cantidad) {
    //Desestructuración para extraer variables:
    const { presupuesto, restante } = cantidad

    //Referencio y agrego texto al HTML:
    document.querySelector('#total').textContent = presupuesto
    document.querySelector('#restante').textContent = restante

  }

  //Métodos:
  imprimirAlerta(mensaje, tipo) {
    //Crear el div:
    const divMensaje = document.createElement('div')
    divMensaje.classList.add('text-center', 'alert')

    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger')
    } else {
      divMensaje.classList.add('alert-success')
    }

    //Agrego texto al mensaje:
    divMensaje.textContent = mensaje

    //Inserto en el HTML:
    document.querySelector('.primario').insertBefore(divMensaje, formulario)

    //Quitar del HTML:
    setTimeout(() => {
      divMensaje.remove()
    }, 2000)

  }

  mostrarGastos(gastos) {
    //Limpio el html:
    this.limpiarHTML()


    //Iterar sobre los gastos: 
    gastos.forEach(gasto => {
      const { cantidad, nombre, id } = gasto

      //Crear una lista:
      const nuevoGasto = document.createElement('li')
      nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center'
      //nuevoGasto.setAttribute('data-id', id) //Atributos personalizados
      nuevoGasto.dataset.id = id             //Hace lo mismo que la línea de arriba 

      //Agregar el HTML del gasto:
      nuevoGasto.innerHTML = `
        ${nombre} 
        <span class='badge badge-primary badge-pill'>
          ${cantidad}
        </span>`

      //Boton para borrar el gasto:
      const btnBorrar = document.createElement('button')
      btnBorrar.classList.add('btn', 'btn-danger', 'btn-gasto')
      btnBorrar.textContent = 'Borrar'

      btnBorrar.onclick = () => {
        eliminarGasto(id)
      }

      nuevoGasto.appendChild(btnBorrar)

      //Agregar al HTML:  
      gastoListado.appendChild(nuevoGasto) //Esto mostrará 2 veces el elemento (debo limpiarHTML)


    })

  }

  actualizarRestante(restante) {
    document.querySelector('#restante').textContent = restante

  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj
    const restanteDiv = document.querySelector('.restante')

    //Comprobar el 25%:
    if ((presupuesto / 4) > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-warning')
      restanteDiv.classList.add('alert-danger')
    }
    else if ((presupuesto / 2) > restante) {
      restanteDiv.classList.remove('alert-success')
      restanteDiv.classList.add('alert-warning')
    }
    else {
      restanteDiv.classList.remove('alert-danger', 'alert-warning')
      restanteDiv.classList.add('alert-success')
    }

    //Si total <= 0:

    if (restante <= 0) {
      ui.imprimirAlerta('El presupuesto se ha agotado', 'error')
      formulario.querySelector('button[type="submit"]').disabled = true
    }


  }


  //? Función que limpia el html para que no se repitan los elementos:
  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild)
    }
  }

}


//Instancio la clase UI:
const ui = new UI()

//Funciones:

//Personalización con sweet alert2:
async function preguntarPresupuesto() {
  const { value: text } = await Swal.fire({
    input: 'text',
    title: '¿Cuál es su presupuesto?',
  })


  if (text === '' || text === null || isNaN(text) || Number(text) < 0) { //isNaN para preguntar si no es un numero
    window.location.reload()
  }
  else {  //Presupuesto validado:
    /* const total = document.querySelector('#total')
    const restante = document.querySelector('#restante')
    total.textContent = text
    restante.textContent = text */
    presupuesto = new Presupuesto(text)
    ui.insertarPresupuesto(presupuesto)
  }
}

const agregarGasto = (e) => {
  e.preventDefault()

  //Leer los datos del formulario:
  //Referencia y extrae el valor del input gasto  
  const nombre = document.querySelector('#gasto').value
  const cantidad = Number(document.querySelector('#cantidad').value)

  //Validación:
  if (nombre === '' || cantidad === '') {
    ui.imprimirAlerta('Ambos campos son obligatorios', 'error')
    return
  }
  else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta('Cantidad no válida', 'error')
    return
  }

  //Generar un objeto con el gasto:
  const gasto = {
    nombre: nombre,
    cantidad: cantidad,
    id: Date.now()
  } //Une nombre y cantidad a gasto (opuesto a desestructuración)

  //Añade un nuevo gasto:
  presupuesto.nuevoGasto(gasto)

  //Mensaje: OK!
  ui.imprimirAlerta('Gasto agregado correctamente')

  //Imprimir los gastos:
  const { gastos, restante } = presupuesto
  ui.mostrarGastos(gastos)
  ui.actualizarRestante(restante)
  ui.comprobarPresupuesto(presupuesto)

  //Reinicio el formulario:
  formulario.reset()

}

function eliminarGasto(id) {
  //Elimina del objeto
  presupuesto.eliminarGasto(id)


  //Elimina gastos del html:
  const { gastos, restante } = presupuesto

  ui.mostrarGastos(gastos)
  ui.actualizarRestante(restante)
  ui.comprobarPresupuesto(presupuesto)

}

eventListeners()

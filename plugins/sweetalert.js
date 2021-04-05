import Swal from 'sweetalert2'
export default ({ app }, inject) => {
  inject('swal', Swal)
}

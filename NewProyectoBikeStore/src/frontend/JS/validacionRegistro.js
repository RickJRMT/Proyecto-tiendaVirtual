const email = document.querySelector('#email');
const contra = document.querySelector('#contraseña');


email.addEventListener('blur', validar)
contra.addEventListener('blur', validarc)

function validar(e){

    if(e.target.id === 'email'){
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/i
        const result = regex.test(e.target.value);

        if(result != true){
            alert ('email no valido')
            return;
        }
    }

}

function validarc (e){

    if(e.target.id === 'contraseña'){
        const regex = /^.{8,}$/
        const result = regex.test(e.target.value);

        if(result != true){
            alert ('la contraseña debe tener mas de 8 caracterez')
            return;
        }
    }

}
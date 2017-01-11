var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []



function update(){
    element.innerHTML = JSON.stringify(moves)
}
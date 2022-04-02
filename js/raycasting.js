var canvas;
var ctx;
var FPS = 50;


//DIMENSIONES DEL CANVAS EN PIXELES
var canvasAncho = 500;
var canvasAlto = 500;

var tamTile = 50;

var escenario; 
var jugador;
const PAREDCOLOR = '#000000';
const SUELOCOLOR = '#666666';
const JUGADORCOLOR = '#FFFFFF';

//OBJETO TILES
var tiles;	

//----------------------------------------------------------------------------------
//NIVEL 1
var nivel1 = [
	
	[1,1,1,3,2,1,1,1,1,1],
	[1,0,0,0,0,0,3,0,0,2],
	[1,0,1,0,0,0,0,0,0,1],
	[1,0,1,0,0,3,0,0,0,1],
	[4,0,0,0,0,1,0,0,0,1],
	[4,0,0,0,0,1,0,0,0,4],
	[1,0,0,1,1,1,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1]
]	

//---------------------------------------------------------------------------------
	//TECLADO

	document.addEventListener('keydown',function(tecla){

		

		switch(tecla.keyCode){

			case 38:
			
			jugador.arriba();

			break;

			case 40:

				jugador.abajo();

			break;

			case 39:

			jugador.derecha();

			break;

			case 37:

				jugador.izquierda();

			break;

		}

	});

	document.addEventListener('keyup',function(tecla){

		switch(tecla.keyCode){

			case 38:
				jugador.avanzaSuelta();
			break;

			case 40:
				jugador.avanzaSuelta();
			break;

			case 39:
				jugador.giraSuelta();
			break;

			case 37:
				jugador.giraSuelta();
			break;


		}


	});

	function rescalaCanvas(){
		canvas.style.width = '800px';
		canvas.style.height = '800px';
			



	}

	function sueloTecho(){

		ctx.fillStyle = "#666666";
		ctx.fillRect(0,0,500,250);


		ctx.fillStyle = "#752300";
		ctx.fillRect(0,250,500,500);




	}

//---------------------------------------------------------------------------------
	//NORMALIZA EL ANGULO

	function normalizaAngulo(angulo){

		angulo = angulo % ( 2 * Math.PI);

		if(angulo < 0){

			angulo = angulo + (2 * Math.PI);
			
			

		}
			
			return angulo;

			
	}


	function distanciaEntrePuntos(x1,y1,x2,y2){

		return Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));

	}	


	function convierteEnRadianes(angulo){

		angulo = angulo * (Math.PI / 180);

		return angulo;
	}


	class Rayo{

		constructor(con,escenario,x,y,anguloJugador,incrementoAngulo,columna){

			this.ctx = con;
			this.escenario = escenario;
			this.x = x;
			this.y = y;

			this.incrementoAngulo = incrementoAngulo;
			this.anguloJugador = anguloJugador;
			this.angulo = anguloJugador + incrementoAngulo;
			

			this.columna = columna;
			this.distancia =0;

			this.wallHitX = 0;
			this.wallHitY = 0;
			
			this.wallHitXHorizontal = 0;
			this.wallHitYHorizontal = 0;

			this.wallHitXVertical = 0;
			this.wallHitYVertical = 0;

			this.pixelTextura = 0;

			this.idTextura = 0;

		}


		setAngulo(angulo){

			this.anguloJugador = angulo;

			this.angulo = normalizaAngulo(angulo + this.incrementoAngulo);



		}


		cast(){

			this.xIntercept = 0;
			this.yIntercept = 0;


			this.xStep = 0;
			this.yStep = 0;

			//AVERIGUAMOS LA DIRECCION EN LA QUE SE MUEVE EL RAYO

			this.abajo = false;
			this.izquierda = false;

			if(this.angulo < Math.PI){

				this.abajo = true;			

			}

			if(this.angulo > Math.PI/2 && this.angulo < 3 * Math.PI/2){

				this.izquierda = true;

			}

		
			//==========================================================================
			//COLISION HORIZONTAL

			var choqueHorizontal = false;

			//BUSCAMOS LA PRIMER INTERSECCION
			this.yIntercept = Math.floor(this.y / tamTile) * tamTile; 

			//SI APUNTA HACIA ABAJO INCREMENTAMOS UN TILE
			if(this.abajo){

				this.yIntercept += tamTile;

			}


			var adjacente = (this.yIntercept - this.y) / Math.tan(this.angulo);
			this.xIntercept = this.x + adjacente;

			//CALCULAMOS LA DISTANCIA DE CADA PASO
			this.yStep = tamTile;
			this.xStep = this.yStep / Math.tan(this.angulo);

			//SI VAMOS HACIA ARRIBA INVERTIMOS EL PASO Y

			if(!this.abajo){

				this.yStep = -this.yStep;	
			}

			//COMPROBAMOS QUE EL PASO X ES COHERENTE
			if((this.izquierda && this.xStep > 0) || (!this.izquierda && this.xStep < 0)) {	

					this.xStep = -this.xStep;



			}

			var siguienteXHorizontal = this.xIntercept;
			var siguienteYHorizontal = this.yIntercept;

			//SI APUNTA HACIA ARRIBA RESTO UN PIXEL PARA FORZAR LA COLISION CON LA CASILLA

			if(!this.abajo){

				siguienteYHorizontal --;

			}

			//BUCLE PARA BUSCAR PUNTO DE COLISION
			while(!choqueHorizontal){

				//OBTENEMOS LA CASILLA REDONDEANDO PARA ABAJO
				var casillaX = parseInt(siguienteXHorizontal/tamTile);
				var casillaY = parseInt(siguienteYHorizontal/tamTile);

				if(this.escenario.colision(casillaX,casillaY)){

					choqueHorizontal = true;
					this.wallHitXHorizontal = siguienteXHorizontal;
					this.wallHitYHorizontal = siguienteYHorizontal;	

				}else{
					siguienteXHorizontal += this.xStep;
					siguienteYHorizontal += this.yStep;
				}
			
			}//Fin del while

		//============================================================================
			//CHOQUE VERTICAL


			var choqueVertical = false;

			//BUSCAMOS LA PRIMER INTERSECCION
			this.xIntercept = Math.floor(this.x / tamTile) * tamTile;


			//SI APUNTA A LA DERECHA INCREMENTAMOS 1 TILE
			if(!this.izquierda){

				this.xIntercept += tamTile;

			}

			//SE LE SUMA EL CATETO OPUESTO 
			var opuesto = (this.xIntercept - this.x) * Math.tan(this.angulo);

			this.yIntercept = this.y + opuesto; 

			//-------------------------------------------------------------------
			//CLACULAMOS LA DISTANCIA DE CADA PASO
			this.xStep = tamTile;

			//SI VA A LA IZQUIERDA, INVERTIMOS
			if(this.izquierda){

				this.xStep = -this.xStep;	
			}

			this.yStep =  tamTile * Math.tan(this.angulo);

			if((!this.abajo && this.yStep > 0) || (this.abajo && this.yStep < 0)){

				this.yStep = -this.yStep;
					
			}


			var siguenteXVertical= this.xIntercept;
			var siguenteYVertical = this.yIntercept;

			if(this.izquierda){

				siguenteXVertical--;

			}	

			//BUCLE CON SALTOS PARA DETECTAR COLISION
			while(!choqueVertical && (siguenteXVertical>=0 && siguenteYVertical>=0 && siguenteXVertical < canvasAncho && siguenteYVertical < canvasAlto)){
					
					//OBTENEMOS LA CASILLA REDONDEANDO PARA ABAJO
					var casillaX = parseInt(siguenteXVertical/tamTile);
					var casillaY = parseInt(siguenteYVertical/tamTile);

					if(this.escenario.colision(casillaX,casillaY)){
							choqueVertical = true;
							this.wallHitXVertical = siguenteXVertical;
							this.wallHitYVertical = siguenteYVertical;

					}else{
						siguenteXVertical += this.xStep;
						siguenteYVertical += this.yStep;
					}


			}

			var distanciaHorizontal = 9999;
			var distanciaVertical = 9999;

			if(choqueHorizontal){
				distanciaHorizontal = distanciaEntrePuntos(this.x,this.y,this.wallHitXHorizontal,this.wallHitYHorizontal);
			}

			if(choqueVertical){

				distanciaVertical = distanciaEntrePuntos(this.x,this.y,this.wallHitXVertical,this.wallHitYVertical);

			}

			if(distanciaHorizontal<distanciaVertical){

				this.wallHitX = this.wallHitXHorizontal;
				this.wallHitY = this.wallHitYHorizontal;
				this.distancia = distanciaHorizontal;

				var casilla = parseInt(this.wallHitX/tamTile);
				this.pixelTextura = this.wallHitX - (casilla * tamTile);	



			}else{
				this.wallHitX = this.wallHitXVertical;
				this.wallHitY = this.wallHitYVertical;
				this.distancia = distanciaVertical;

				var casilla = parseInt(this.wallHitY/tamTile);
				this.pixelTextura = this.wallHitY - (casilla * tamTile);
			}

			this.idTextura = this.escenario.tile(this.wallHitX,this.wallHitY);



				
			//CORRECCION DE OJO DE PEZ
			this.distancia = this.distancia * Math.cos(this.anguloJugador - this.angulo);

			zBuffer[this.columna] = this.distancia;
		}


		renderPared(){



			var altoTile = 500;
			var distanciaPlanoProyeccion = (canvasAncho/2) / Math.tan(medioFOV);
			var alturaMuro = (altoTile / this.distancia) * distanciaPlanoProyeccion;

			//CALCULAMOS DONDE EMPIEZA Y TERMINA LA LINEA
			var y0 = parseInt(canvasAlto/2) - parseInt(alturaMuro/2);
			var y1 = y0 + alturaMuro;
			var x = this.columna;

			//DIBUJAMOS CON TEXUTRA
			var altoTextura = 64;
			var alturaImagen = y0 - y1;

			ctx.imageSmoothingEnable = false;

			ctx.drawImage(
				tiles,   											//imagen png
				this.pixelTextura,									//x clipping 
				(this.idTextura -1) * altoTextura,					//y clipping
				1, 													//ancho clipping
				64,													//alto clipping
				this.columna,       								//x donde empieza a dibujar
				y1, 												//y donde emipeza a dibujar
				1,													// anchura real 1px
				alturaImagen




				);


			/*
			//DIBUJAMOS LA COLUMNA (LINEA)
			this.ctx.beginPath();
			this.ctx.moveTo(x,y0);
			this.ctx.lineTo(x,y1);
			this.ctx.strokeStyle = '#666666';
			this.ctx.stroke();*/





		}

 
 		dibuja(){

 				

 				this.cast();

 				this.renderPared();

 				
 				/*
 				//MOSTRAR LINEA RAYO
 				var xDestino = this.wallHitX;
 				var yDestino = this.wallHitY;




 				this.ctx.beginPath();
 				this.ctx.moveTo(this.x,this.y);
 				this.ctx.lineTo(xDestino,yDestino);
 				this.ctx.strokeStyle = 'red';
 				this.ctx.stroke();*/
				
 		}

	}

//---------------------------------------------------------------------------------
//CLASE ESCENARIO
		
	class Level{

		constructor(can,con,arr){
			this.canvas = can;
			this.ctx = con;
			this.matriz = arr;


			//DIMENSIONES MATRIZ
			this.altoM = this.matriz.length;
			this.anchoM = this.matriz[0].length;

			//DIMESIONES REALES DEL CANVAS
			this.altoC = this.canvas.height;
			this.anchoC = this.canvas.width;

			//DIMENSIONES DE LOS TILES
			 this.altoT = parseInt(this.altoC/this.altoM);
			 this.anchoT = parseInt(this.anchoC/this.anchoM);



		}


			colision(x,y){

				var choca = false;

				if(this.matriz[y][x]!=0){

						choca = true;

					}

				return choca;
			}	


		tile(x,y){

			var casillaX = parseInt(x/this.anchoT);
			var casillaY = parseInt(y/this.altoT);	
			return (this.matriz[casillaY][casillaX]);
		}	


		dibuja(){
			var color;
			
			for( var y=0; y <this.altoM; y++){
				
				for( var x=0; x<this.anchoM; x++){
					
					if(this.matriz[y][x]==1){
							color = PAREDCOLOR;
					 }else{
					 		color = SUELOCOLOR;
					}	

					 this.ctx.fillStyle = color;

					 this.ctx.fillRect(x * this.anchoT, y * this.altoT,this.anchoT,this.altoT);




				}
			}	
		}

	}

	const FOV = 60;

	const medioFOV = FOV/2;


var ray;
var tiles;
var imgArmor;
var imgPlanta;

var sprites = [];
var zBuffer = [];




class Sprite{

	constructor(x,y,imagen){
		this.x = x;
		this.y = y;
		this.imagen = imagen;

		this.distancia = 0;
		this.angulo = 0;

		this.visible = false;



	}

	calculaAngulo(){

		var vectX = this.x -  jugador.x;
		var vectY = this.y -  jugador.y;


		var aguloJugadorObjeto = Math.atan2(vectY,vectX);

		var diferenciaAngulo =  jugador.anguloRotacion - anguloJugadorObjeto;

		if(diferenciaAngulo < -1 * Math.PI){

			diferenciaAngulo += 2.0 * Math.PI;
		}
		if(diferenciaAngulo > Math.PI){

			diferenciaAngulo -= 2.0 * Math.PI;

		}

		diferenciaAngulo = Math.abs(diferenciaAngulo);


		if(diferenciaAngulo < FOV_medio){

			this.visible = true;	
		}else{
			this.visible = false;
		}

	}

	claculaDistanacia(){

		this.distancia = distanciaEntrePuntos(jugador.x,jugador.y,this.x, this.y);

	}

	actualizaDatos(){

		this.calculaAngulo();
		this.claculaDistanacia();

	}

	dibjua(){

		this.actualizaDatos();

		if(this.visible == true){

			var altoTile = 500;
			var distanciaPlanoProyeccion = (canvas.ancho/2) / Math.tan(FOV/2);

			var alturaSprite = altoTile / this.distancia * distanciaPlanoProyeccion;


			var y0 = parseInt(canvasAlto/2) - parseInt(alturaSprite/2);
			var y1 = y0 + alturaSprite;

			var altoTextura = 100;
			var anchoTextura = 100;


			var alturaTextura = y0-y1;
			var anchuraTextura  = alturaSprite;


			//distancia plano proyeccion
			var viewDist = 500;

			var dx = jugador.x - this.x;
			var dy = jugador.y - this.y;

			var spriteAngle = Math.atan2(dy,dx) - jugador.anguloRotacion;

			var x0 = Math.tan(spriteAngle) * viewDist;
			var x = (canvasAncho/2 + x0 - anchuraTextura/2);




			ctx.imageSmoothingEnable = false;

			//proporcion de anchura de x (segun nos acerquemos, se veran mas anchas las líneas verticales);
			var anchuraColumna = alturaTextura/altoTextura;


			//Dubujamos el sprite columna a columna para evitar que se sobreponga con el  muro
			//se usan dos bucles para asegurar que el dibujo de linea de tiras de la imagen

			for(let i = 0; i<anchoTextura; i++){

				for(let j =0; j< anchuraTextura; j++){

					var x1 = parseInt(x+((i-1)*anchuraColumna)+j);


					//Comprobamos  la linea acutual con la distanacia del zbuffer sino la dibujamos
					if(zBuffer[x1] > this.distancia){

						ctx.drawImage(this.imagen,i,0,1,altoTextura-1,x1,y1,1,alturaTextura);
					}

				}

			}
		}

	}



}

	
		function renderSpirtes(){

			sprites.sort(function(obj1,obj2){

				return obj2.distanacia - obj1.distanacia;


			});

		}



class Player{

		constructor(con,escenario,x,y){

			this.ctx = con;
			this.escenario = escenario;

			this.x = x;
			this.y = y;

			this.avanza = 0; //0 = parado, 1 = adelanta, -1 = atras
			this.gira = 0; // -1 = giro a la izquierda ,  1 = giro derecha

			this.anguloRotacion = 0;

			this.velMovimiento = 3; 		 //PIXELS

			this.velGiro = 3 * (Math.PI/180);//GRADOS  


			//RAYOS
			this.numRayos = canvasAncho;
			this.rayos = [];

			//CALCUALR EL ANGULO DE CADA RAYO
			

			var incrementoAngulo = convierteEnRadianes(FOV/this.numRayos);
			var anguloInicial = convierteEnRadianes(this.anguloRotacion - medioFOV);

			var anguloRayo = anguloInicial;


			//CREAMOS LOS RAYOS

			for(let i = 0; i< this.numRayos; i++){

				this.rayos[i] = new Rayo(this.ctx,this.escenario,this.x,this.y,this.anguloRotacion,anguloRayo,i);

				anguloRayo += incrementoAngulo;	

			}	



		}


		arriba(){

			this.avanza = 1;
			
		}

		abajo(){

			this.avanza = -1;
				
		}

		izquierda(){

			this.gira = -1;
		}

		derecha(){

			this.gira = 1;

		}

		

		avanzaSuelta(){

			this.avanza  = 0;

		}

		giraSuelta(){

			this.gira = 0;

		}

		colision(x,y){

			var choca = false;

			//AVERIGUAMOS EN QUE CASILLA ESTA EL JUGADOR
			var casillaX = parseInt(x/this.escenario.anchoT);
			var casillaY = parseInt(y/this.escenario.altoT);

			if(this.escenario.colision(casillaX,casillaY)){

				choca = true;

				return choca;
			}
		}
		actualiza(){
			//AVANZAMOS

			var nuevaX = this.x + (this.avanza * Math.cos(this.anguloRotacion) * this.velMovimiento);
			var nuevaY = this.y + (this.avanza * Math.sin(this.anguloRotacion) * this.velMovimiento);

			if(!this.colision(nuevaX,nuevaY)){

			this.x = nuevaX;
			this.y = nuevaY;

		}

			//GIRAMOS

			this.anguloRotacion += this.gira * this.velGiro;
			this.anguloRotacion = normalizaAngulo(this.anguloRotacion);

			//ACTUALIZAMOS EL ANGULO DEL RAYO
			

			for(let i = 0 ; i< this.numRayos;i++){

				this.rayos[i].x = this.x;
				this.rayos[i].y = this.y;
				this.rayos[i].setAngulo(this.anguloRotacion);



			}

			//this.rayo.setAngulo(this.anguloRotacion);
		
			//this.rayo.x = this.x;
			//this.rayo.y = this.y;	

		}	

		dibuja(){
			
			this.actualiza();
			
			
			for(let i = 0; i< this.numRayos;i++){
				
				//this.rayos[i].dibuja(); 
				this.rayos[i].dibuja();				
			}

			//this.rayo.dibuja();
			
			/*
			//CUADRITO
			this.ctx.fillStyle = JUGADORCOLOR;
			this.ctx.fillRect(this.x-3,this.y-3,6,6);

			//LINEA DE DIRECCION
			var xDestino = this.x + Math.cos(this.anguloRotacion) * 40;
			var yDestino = this.y + Math.sin(this.anguloRotacion) * 40;

			this.ctx.beginPath();
			this.ctx.moveTo(this.x,this.y);
			this.ctx.lineTo(xDestino, yDestino);
			this.ctx.strokeStyle = '#FFFFFF';
			this.ctx.stroke();*/

			
		}

}	

//---------------------------------------------------------------------------------
function inicializaSprites(){

	//cargamos Sprites
	imgArmor = new Image();
	imgArmor.src = "img/HF1_Mimic.png";

	//creamos los objetos para los sprites
	sprites[0] = new Sprite(300,120,imgArmor);
	sprites[1] = new Sprite(300,150,imgArmor);
	sprites[2] = new Sprite(300,300,imgArmor);
	sprites[3] = new Sprite(300,380,imgArmor);


}
//---------------------------------------------------------------------------------

function inicializa(){

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');


	//MODIFICAMOS EL TAMAÑO DEL CANVAS

	canvas.width = canvasAncho;
	canvas.height = canvasAlto;


	rescalaCanvas();

	escenario = new Level(canvas,ctx,nivel1);

	jugador = new Player(ctx,escenario,180,100);

	//CARGAMOS LA IMAGEN DE LOS TILES
	tiles = new Image();
	tiles.src = "img/wall.png";

	inicializaSprites();

	//INICIALIZAMOS EL BUCLE PRINCIPAL EN EL INTERVALO
	setInterval(function(){principal();},1000/FPS);
}


function borraCanvas(){
	canvas.width = canvas.width;
	canvas.height = canvas.height;

}


function principal(){

borraCanvas();

//escenario.dibuja();
sueloTecho();

jugador.dibuja();

renderSpirtes();

}
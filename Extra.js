// ======================= [ Support ] =======================

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

// ======================= [ META ] =======================

function clearState(){
	clearList = ["deck","portal"];
	["C","T","PP"].forEach((e)=>{[1,2,3,4].forEach((n)=>{clearList.push(e+n)})});
	clearList.forEach((i)=>{
		document.getElementById(i).removeAttribute("onclick");
		document.getElementById(i).style.cursor="not-allowed";
		document.getElementById(i).style.filter= "";
	});
	["P","S","SH"].forEach((e)=>{
		[1,2].forEach((p)=>{
			document.getElementById(e+p).style.opacity = ((p==NextPlayer)?1:.5);
		});
	});
}

function setState(){
	let Stones = document.getElementById("SH"+NextPlayer).childNodes
	
	if(Stones.length){
		[1,2,3,4].forEach((n)=>{
			document.getElementById("PP"+n).setAttribute("onclick","drawCard("+n+");drawTile("+n+")")
			document.getElementById("C"+n).setAttribute("onclick","choose('T',"+n+")")
			document.getElementById("T"+n).setAttribute("onclick","choose('C',"+n+")")
		});

		document.getElementById("deck").setAttribute("onclick","shuffleCards()")
		document.getElementById("portal").setAttribute("onclick","shuffleTiles()")
		clearList = ["deck","portal"];
	}else{
		["C","T","PP"].forEach((e)=>{[1,2,3,4].forEach((n)=>{
			document.getElementById(e+n).setAttribute("onclick","drawCard("+n+");drawTile("+n+")");
		})});
		clearList = [];
	}


	["C","T","PP"].forEach((e)=>{[1,2,3,4].forEach((n)=>{clearList.push(e+n)})});
	clearList.forEach((i)=>{
		document.getElementById(i).style.cursor="pointer";
	});
}

// ======================= [ TETRIS ] =======================


function clearPreview() {
	this.parentNode.querySelectorAll('div').forEach(cell => {
		cell.setAttribute("class","tile "+cell.getAttribute("gid").substring(0,1));
	});
}

function showPreview(){
	tx = Number(this.getAttribute("X"))
	ty = Number(this.getAttribute("Y"))

	//Show if piece is placeable
	if(this.parentNode.id=="S"+NextPlayer){
		NextTile.forEach((R,rc)=>{
			R.forEach((C,cc)=>{
				if(C&&canPlace(tx,ty,this.parentNode)){this.parentNode.querySelectorAll("[X='"+(tx+cc)+"'][Y='"+(ty+rc)+"']")[0].classList.add(NextColor)}
				if(C&& !canPlace(tx,ty,this.parentNode)){this.parentNode.querySelectorAll("[X='"+(tx+cc)+"'][Y='"+(ty+rc)+"']")[0].classList.add("invalid")}
			})
		})
	}
	//Highlight piece on hover
	if(this.getAttribute("gid")){
		document.querySelectorAll("[gid='"+this.getAttribute("gid")+"']").forEach((s)=>{
			s.classList.add("selected")
		})
	}
}

function placeTile() {
	tx = Number(this.getAttribute("X"))
	ty = Number(this.getAttribute("Y"))
	if(canPlace(tx,ty,this.parentNode)&&(this.parentNode.id=="S"+NextPlayer)){
		NextTile.forEach((R,rc)=>{
			R.forEach((C,cc)=>{
				if(C){this.parentNode.querySelectorAll("[X='"+(tx+cc)+"'][Y='"+(ty+rc)+"']")[0].setAttribute("gid",NextGID)}
			})
		})
		NextGID = ""
		NextTile = []
		NextColor = ""
		document.getElementById("NT").innerHTML = ""
		document.getElementById("next").style.visibility = "hidden"
		
		//Next Player's turn
		if(!Solo){NextPlayer = (NextPlayer%2)+1}
		clearState();
		setState();
		
		//Check for End-of-game
//		if(!document.getElementById("deck").childNodes.length){
		if(end){
			clearState();
			endGame();
		}
	}
}

function canPlace(tx,ty,sanct){
	flag = true
	hasAdj = false
	NextTile.forEach((Rc,rcc)=>{
		Rc.forEach((Cc,ccc)=>{
			if((Cc&&sanct.querySelectorAll("[X='"+(tx+ccc)+"'][Y='"+(ty+rcc)+"']")[0].getAttribute("gid"))!=0){flag = false}

			if (sanct.querySelectorAll("[gid='']").length==400){
				hasAdj = true
			} else if(Cc){
				adj.forEach((a)=>{
					tadj = [tx+ccc+a[0],ty+rcc+a[1]]
					if((tadj[0]>=0&&tadj[0]<20&&tadj[1]>=0&&tadj[1]<20)&&sanct.querySelectorAll("[X='"+(tadj[0])+"'][Y='"+(tadj[1])+"']")[0].getAttribute("gid")){hasAdj = true}
				})
			}

		})
	})
	return (flag&&hasAdj)
}

function rotateNext(turnCW) {
    // Rotate counterclockwise
    if (turnCW == -1) {
        NextTile = NextTile.map(row => row.slice().reverse());
    }
    // Rotate clockwise
    else if (turnCW) {
        NextTile = NextTile.map((val, index) => NextTile.map(row => row[index]).reverse());
    }
    // Horizontal flip
    else {
        NextTile = NextTile.map((val, index) => NextTile.map(row => row[row.length - 1 - index]));
    }

    // Normalize the tile layout
    NextTile = normalize(NextTile);

    // Update the display
    updateDisplay();
    clearPreview.call(document.getElementById("S"+NextPlayer).childNodes[0]);
}

function normalize(matrix) {
    // Remove and count empty rows
    let nonEmptyRows = matrix.filter(row => row.some(cell => cell !== 0));
    let emptyRowCount = matrix.length - nonEmptyRows.length;
    while (emptyRowCount-- > 0) nonEmptyRows.push(new Array(matrix[0].length).fill(0));

    // Remove and count empty columns
    let transposed = nonEmptyRows[0].map((col, i) => nonEmptyRows.map(row => row[i]));
    let nonEmptyCols = transposed.filter(col => col.some(cell => cell !== 0));
    let emptyColCount = transposed.length - nonEmptyCols.length;
    while (emptyColCount-- > 0) nonEmptyCols.push(new Array(nonEmptyRows.length).fill(0));

    // Transpose back if necessary
    return nonEmptyCols[0].map((col, i) => nonEmptyCols.map(row => row[i]));
}

function updateDisplay() {
    const container = document.getElementById("NT");
    container.style.width = NextTile.length * 40 + "px";
    container.innerHTML = "";
    NextTile.forEach(row => {
        row.forEach(cell => {
            container.innerHTML += '<div class="tile '+(cell ? NextColor : "")+'"></div>';
        });
    });
}

function moveField(dir) {
    const grid = document.getElementById("S"+NextPlayer);
    const offsets = { 'up': [0, 1], 'down': [0, -1], 'left': [1, 0], 'right': [-1, 0] };
    const edgeSelector = {
        'up': "[Y='0']",
        'down': `[Y='${gridSize - 1}']`,
        'left': "[X='0']",
        'right': `[X='${gridSize - 1}']`
    };

    if (Array.from(grid.querySelectorAll(edgeSelector[dir] + "[gid='']")).length === gridSize) {
        let [dx, dy] = offsets[dir];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                let x = dir === 'right' ? gridSize - 1 - i : i;
                let y = dir === 'down' ? gridSize - 1 - j : j;
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                    grid.querySelector(`[X='${x}'][Y='${y}']`).setAttribute("gid",
                        grid.querySelector(`[X='${nx}'][Y='${ny}']`).getAttribute("gid"));
                } else {
                    grid.querySelector(`[X='${x}'][Y='${y}']`).setAttribute("gid", '');
                }
            }
        }
    }
	clearPreview.call(grid.childNodes[0]);
}

// ======================= [ TILES & CARDS ] =======================

// 							###[ TILES ]###
function drawTile(holder){
	piece = Bag.shift()
	var THolder = document.getElementById("T"+holder)

	
	//Send to Next
	if(THolder.getAttribute("gid")){
		NextGID = THolder.getAttribute("gid")
		NextTile = Tetris[THolder.getAttribute("gid").substring(1,2)]
		NextColor = THolder.getAttribute("gid").substring(0,1)
		updateDisplay()
		
		let next = document.getElementById("next").style
		next.left = "unset"
		next.right = "unset"
		if(NextPlayer%2){next.left = "475px"}else{next.right = "475px"}
		next.visibility = "visible"

		THolder.innerHTML = ""
		THolder.setAttribute("gid","")

		if(Solo){
			slideRight(holder,"T")
			clearTile(4);
	
			holder = 1;
			THolder = document.getElementById('T1');
		}


	}
	
	THolder.innerHTML = ""
	THolder.style.opacity = 0;
	THolder.setAttribute("gid",piece)
	color = piece.substring(0,1)
	shape = piece.substring(1,2)

	
	e=0
	Tetris[shape].forEach((a)=>{
		for (i=0;i<2;i++){
			THolder.innerHTML += '<div class="tile '+(a[i]?color:"")+'"></div>'
			e++
		}
	})
	
	for (e;e<8;e++){
		THolder.innerHTML += '<div class="tile"></div>'
	}

	THolder.style.transform = "TranslateX(-"+(180*holder)+"px)";
	THolder.style.animation = "";
	
	setTimeout(()=>{
		THolder.style.animation = "slideIn 0."+(2+holder)+"s ease-out forwards";
	},10)

	setTimeout(()=>{
		THolder.style.animation = "";
		THolder.style.opacity = 1;
		THolder.style.transform = "rotate("+(Math.floor(Math.random()*17)-8)+"deg)"
	},(holder*100)+190)
}


function undrawTile(th){
	let THolder = document.getElementById("T"+th)

	THolder.style.transform = "TranslateX(-"+(180*th)+"px)";
	THolder.style.animation = "";
	
	setTimeout(()=>{
		THolder.style.animation = "slideOut 0."+(2+th)+"s ease-out forwards";
	},10)
}


function clearTile(holder){
	let THolder = document.getElementById("T"+holder)
	THolder.style.animation = "";

	setTimeout(()=>{
		THolder.style.animation = "slideOut 0."+(2+holder)+"s ease-out forwards";
		THolder.style.transform = "TranslateX("+(180*(5-holder))+"px)";
	},10)

	setTimeout(()=>{
		THolder.innerHTML = ""
		THolder.setAttribute("gid","")
		THolder.style.animation = "";
		THolder.style.transform = "rotate("+(Math.floor(Math.random()*17)-8)+"deg)"
		slideRight(holder,"T")
		drawTile(1)
	},250+holder*100)

}

// 							###[ CARDS ]###

function pickCard(holder, player) {
    var card = document.getElementById("C" + holder).getElementsByClassName("card")[0];
    var targetHolder = document.getElementById('P' + player + card.getAttribute("gid").substring(0,1));

	//Check for Arcane Stone / Essence
	if(card.classList.contains("essence")){
		card.classList.remove("essence");
		temp = document.createElement("div")
		temp.classList.add("stone")
		document.getElementById("SH"+player).appendChild(temp)
	}

    // Calculate initial and target positions based on the viewport
    var cardRect = card.getBoundingClientRect();
    var targetRect = targetHolder.getBoundingClientRect();

    // Set the card for animation
    card.style.position = 'fixed';
    card.style.top = cardRect.top + 'px';
    card.style.left = cardRect.left + 'px';
    card.style.zIndex = 1000;  // Ensure it's on top during transition

    // Append to body to allow free movement
    document.body.appendChild(card);

    // Calculate the number of cards of the same type to set the newY
    var cardsOfSameType = targetHolder.getElementsByClassName("card").length;
    var newY = cardsOfSameType * 50;  // 50px gap for each card, stacking upwards

    // The scale for transition is 0.7 to match the holder's scale, 
    // but it needs to be set to 1.0 once it is in the holder
    var transitionScale = 0.7;
    var finalScale = 1.0;  // Scale to 1.0 relative to the holder

    // Transition the card to the new position with scaling
    requestAnimationFrame(() => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translate(${targetRect.left -25 - cardRect.left}px, ${targetRect.top - cardRect.top - 48 - (.7*newY)}px) scale(${transitionScale})`;

        // Listen for the end of the transition
        card.addEventListener('transitionend', function handleTransitionEnd() {
            card.removeEventListener('transitionend', handleTransitionEnd);

            // Cleanup fixed positioning and styles
            card.style.position = '';
            card.style.top = '';
            card.style.left = '';
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.width = '';  // Reset width if necessary
            card.style.transition = '';


            // Move card into the target holder
            targetHolder.appendChild(card);
            // Reset transform for new card position in container
            card.style.bottom = newY +"px";
        });
    });
}


function drawCard(holder) {
    let card = Deck.shift();
	
	clearState()

    const deck = document.getElementById('deck').getElementsByClassName("card");
    let movingCard = deck[deck.length - 1];
    var targetHolder = document.getElementById('C' + holder);

//	if(movingCard && movingCard._tippy!=undefined){movingCard._tippy.destroy()}


	// Clear the holder
	if(targetHolder.innerHTML != ""){
		pickCard(holder,NextPlayer)

		if(Solo){
		
			pickCard(((holder==4)?3:4),2);
			slideRight(holder,"C")
			slideRight(4,"C")

			setTimeout(()=>{
				drawCard(2)
			},500)
	
			holder = 1;
			targetHolder = document.getElementById('C1');
		}
	}

	if(!document.getElementById('deck').getElementsByClassName("card").length){end = true}else{

		//Update #Cards left
		let cardsLeft = document.getElementById('deck').getElementsByClassName("card").length-1
		if(document.getElementById('deck')._tippy!=undefined){document.getElementById('deck')._tippy.destroy()}
		decktippy = tippy(document.getElementById("deck"),{appendTo: document.getElementById('deck'),content:cardsLeft})


		// Get initial and final positions
		let startPos = movingCard.getBoundingClientRect();
		let endPos = targetHolder.getBoundingClientRect();

		// Prepare the card for moving by positioning it absolutely
		document.body.appendChild(movingCard);
		movingCard.style.position = 'absolute';
		movingCard.style.left = startPos.left + 'px';
		movingCard.style.top = startPos.top + 'px';
		movingCard.style.zIndex = '1';

		// Set up initial transformation and transition
		movingCard.style.transition = 'left 0.5s ease-out, top 0.5s ease-out, transform 0.5s ease-out';
		movingCard.style.transform = "rotateY(0deg)"; // Start with no rotation

		// Move the card and start the flip simultaneously
		requestAnimationFrame(() => {
			movingCard.style.left = (endPos.left + 5) + 'px';
			movingCard.style.top = (endPos.top - 5) + 'px';
	//        movingCard.style.transform = "rotateY(360deg)"; // Flip while moving
			movingCard.style.transform = "rotateY(360deg) rotate(" + (Math.floor(Math.random() * 8) - 4) + "deg)";

			// Set the card's background image
			setTimeout(() => {
				movingCard.style.backgroundImage = "url(Cards/Creatures/" + card + ".png)";
			}, 250);

			setTimeout(() => {
				// After move and flip complete, finalize position within targetHolder
				targetHolder.appendChild(movingCard);
				movingCard.style.position = '';
				movingCard.style.left = '10px';
				movingCard.style.top = '10px';

				// Remove transitions to lock in final state
	//            movingCard.style.transition = '';
	//            movingCard.style.transform = '';

				// Set additional properties
				movingCard.setAttribute("gid", card);
				let c = card.substring(0, 1);
				let s = card.substring(1, 2);
				movingCard.classList.remove("essence");
				if ((Colors.includes(c) && Special.includes(s)) || (c === "K" && s === "0")) {
					movingCard.classList.add("essence");
				}
			}, 500); // Wait for the move and flip to complete
		});
	}
}


function undrawCard(holder) {
    let movingCard = document.getElementById('C' + holder).getElementsByClassName("card")[0];
    const targetHolder = document.getElementById('deck');
	
	Deck.push(movingCard.getAttribute("gid"))

    // Get initial and final positions
    let startPos = movingCard.getBoundingClientRect();
    let endPos = targetHolder.getBoundingClientRect();

	//Remove Stone before Shuffling
	movingCard.classList.remove("essence");

    // Prepare the card for moving by positioning it absolutely
    document.body.appendChild(movingCard);
    movingCard.style.position = 'absolute';
    movingCard.style.left = startPos.left + 'px';
    movingCard.style.top = startPos.top + 'px';

    // Set up initial transformation and transition
    movingCard.style.transition = 'left 0.5s ease-out, top 0.5s ease-out, transform 0.5s ease-out';
    movingCard.style.transform = "rotateY(0deg)"; // Start with no rotation

    requestAnimationFrame(() => {
		k = document.getElementById('deck').getElementsByClassName("card").length
		movingCard.style.left = endPos.left+ (-20 - 0.2 * k) + "px";
		movingCard.style.top = endPos.top - 5 - 0.5 * k + "px";


        movingCard.style.transform = "rotateY(360deg)"; // Flip while moving

        // Change the background image halfway through the move
        setTimeout(() => {
            movingCard.style.backgroundImage = "url(Cards/Back/Creatures.png)";
        }, 250); // Half of the total transition time (500ms)

        setTimeout(() => {
            // After move and flip complete, finalize position within targetHolder
            targetHolder.appendChild(movingCard);
            movingCard.style.position = '';
			movingCard.style.left = (-10 - 0.2 * k) + "px";
			movingCard.style.top = - 0.5 * k + "px";
            movingCard.style.transition = '';
            movingCard.style.transform = '';

            // Clear any specific attributes and classes
            movingCard.setAttribute("gid", "");
        }, 500); // Wait for the move and flip to complete
    });
}


function slideRight(c,item){
	for(let i = c-1;i>0;i--){
		const newHolder = document.getElementById(item + (i+1));
		const oldHolder = document.getElementById(item + i);
		
		newHolder.setAttribute("gid",oldHolder.getAttribute("gid"))
		newHolder.innerHTML = oldHolder.innerHTML

		oldHolder.setAttribute("gid","")
		oldHolder.innerHTML = ""
	}
}

// 							###[ MISC ]###

function undealCards(){for(dc = 1; dc< 5; dc++){undrawCard(dc)}}


function dealCards(){for(dc = 1; dc< 5; dc++){drawCard(dc)}}
function dealTiles(){for(j = 1; j< 5; j++){drawTile(j)}}


function choose(item,number){
	clearState();
	setState();
	document.getElementById(((item=="T")?"C":"T")+number).setAttribute("onclick","clearState();setState();");
	[1,2,3,4].forEach((n)=>{
		document.getElementById(item+n).setAttribute("onclick","drawCard("+((item=="T")?number:n)+");drawTile("+((item=="C")?number:n)+");"+((number==n)?"":"document.getElementById('SH"+NextPlayer+"').childNodes[0].remove();"))
		if(number!=n){
			document.getElementById(((item=="T")?"C":"T")+n).style.filter = "brightness(.5)";
			document.getElementById(((item=="T")?"C":"T")+n).style.zIndex = 1;
		}
	});	
}

function shuffleCards(){
	let Stones = document.getElementById("SH"+NextPlayer).childNodes
	if(Stones.length){
		clearState()
		Stones[0].remove()
		undealCards()
		shuffle(Deck)
		setTimeout(() => {animateShuffle()},600)
		setTimeout(() => {animateShuffle()},1300)
		setTimeout(() => {animateShuffle()},2000)
		setTimeout(() => {dealCards()},2700)
		setTimeout(() => {setState()},3000)
	}else{
		alert("Not Enough Stones")
	}

}

function shuffleTiles(){
	let Stones = document.getElementById("SH"+NextPlayer).childNodes
	if(Stones.length){
		clearState()
		Stones[0].remove()
		for(i = 1; i< 5; i++){
			let h = document.getElementById("T"+i)
			Bag.push(h.getAttribute("gid"))
			h.setAttribute("gid","")
			undrawTile(i)
		}
		shuffle(Bag)
		setTimeout(() => {dealTiles()},700)
		setTimeout(() => {setState()}, 800)
	}else{
		alert("Not Enough Stones")
	}
}

function animateShuffle(){
	left = []
	right = []
	deckCards = document.getElementById("deck").getElementsByClassName("card")
	for(i=0;i<deckCards.length;i++){
		delta = 135*0.5*(1 + Math.random());
		if(Math.random()<.5){right.push(i)}else{left.push(i);delta*=(-1)}
		deckCards[i].style.left = Number(deckCards[i].style.left.replace("px",""))+delta+ "px"
	}
	setTimeout(() => {
		deckCards = document.getElementById("deck").querySelectorAll('.card');
		deckCards.forEach((card, k) => {
			let nextCardIndex = ((Math.random() < 0.5) ? (left.length ? left.shift() : right.shift()) : (right.length ? right.shift() : left.shift()));
			let nextCard = deckCards[nextCardIndex];

			document.getElementById("deck").appendChild(nextCard); // Re-append to ensure order is visually updated

			// Force a reflow by accessing the offsetHeight property
			nextCard.offsetHeight;

			requestAnimationFrame(() => {
				// Set new positions to trigger the animation
				nextCard.style.left = (-10 - 0.2 * k) + "px";
				nextCard.style.top = -0.5 * k + "px";
			});
		});
	},300)
}

// ======================= [ TRIALS ] =======================


function ArcaneTrial(){
	PlainModal.closeByEscKey = true
	PlainModal.closeByOverlay = true
	
	if(Solo){document.getElementById("Pawn2").style.display = 'none';}

	document.getElementById("CommonArea").style.display = 'none';
	document.getElementById("scoreBoard").style.display = 'inline-block';
	ttemp = ["","",""];
	[1,2].forEach((p)=>{
		if(!(p==2&&Solo)){
			document.getElementById("S"+p).style.opacity = .5;
			document.getElementById("P"+p).style.opacity = .5;
			addPts(document.getElementById("SH"+p).childNodes.length*4,p)
			ttemp[p] = tippy('#SH'+p,{content:document.getElementById("SH"+p).childNodes.length*4,trigger:'manual',hideOnClick: false,appendTo: document.getElementById("SH"+p)})
			ttemp[p][0].show()
		}
	})
	BTN.childNodes[0].innerHTML = "Sanctuary Trial"
	BTN.style += ";position:absolute;left:0;right:0;bottom:-115px;";
	BTN.setAttribute("onclick","SanctuaryTrial(1)")
	document.getElementById("scoreBoard").appendChild(BTN)
}

function SanctuaryTrial(g){
	if(g==1){
		document.getElementById("scoreBoard").style.transform = 'scale(.8) translateY(-100px)';
		[1,2].forEach((p)=>{
			if(!(p==2&&Solo)){
				document.getElementById("S"+p).style.opacity = 1;
				document.getElementById("SH"+p).style.opacity = .5;
				document.getElementById("P"+p).style.opacity = .5;
				ttemp[p][0].destroy();
				document.getElementById("SH"+p).setAttribute("stones",document.getElementById("SH"+p).childNodes.length);
				document.getElementById("SH"+p).innerHTML = "";
			}
		})

		document.body.appendChild(document.getElementById("Goals"))
	}
	
	let goal = document.getElementById("G"+g);
	let goalid = goal.getAttribute("gid")[1];
	[1,2].forEach((p)=>{
		if(!(p==2&&Solo)){
			addPts(goalPoints(goalid,p),p)
			var k = tippy(goal,{content: goalPoints(goalid,p), multiple: true,appendTo: 'parent', placement:((p%2)?"top-start":"top-end")})
			k.show()
		}
	})

	document.getElementById("Goals").querySelectorAll(".card").forEach((gg)=>{
		gg.style.filter = "brightness("+((gg.id[1]==g)?1:.3)+")";
		gg.style.transform = ((gg.id[1]==g)?"translateY(-25px) scale(1.25)":"")
	});

	if(g==3){
		BTN.childNodes[0].innerHTML = "Creatures Trial"
		BTN.setAttribute("onclick","CreaturesTrial()")
	}else{
		BTN.childNodes[0].innerHTML = "Sanctuary Card"
		BTN.setAttribute("onclick","SanctuaryTrial("+(g+1)+")")
	}
}

function CreaturesTrial(){

	document.querySelectorAll("[id^='tippy']").forEach(t=>{
		t.remove()
	})

	document.getElementById("scoreBoard").style.display = 'none';
	document.getElementById("Goals").style.display = 'none';
	document.getElementById("trackerHolder").style.display = 'inline-block';
	[1,2].forEach((p)=>{
		if(!(p==2&&Solo)){
			document.getElementById("S"+p).style.display = "none";
			document.getElementById("SH"+p).style.opacity = .5;
			document.getElementById("P"+p).style.opacity = 1;
		};

		[...Colors,"K"].forEach((c)=>{
			power[p-1][c] = document.getElementById("P"+p+c).childNodes.length
			document.getElementById("Tracker"+p).getElementsByClassName(c)[0].style.transform = "translateY(-"+(45*power[p-1][c])+"px)"
			tippy(document.getElementById("Tracker"+p).getElementsByClassName(c)[0],{allowHTML: true,appendTo: 'parent',content:power[p-1][c]+" <img src='imgs/"+c+".svg' style='height: 30px'/>"})
		})
	})
	
	BTN.childNodes[0].innerHTML = "Check Majority"
	BTN.setAttribute("onclick","CheckMajority()")
	BTN.style.bottom = "15px"
	BTN.style.width = "850px"
	BTN.style.margin = "0 auto"
	document.getElementById("trackerHolder").appendChild(BTN)	
}

function CheckMajority(){
	[1,2].forEach((p)=>{
	
		ttrack = document.getElementById("Tracker"+p)
		ttrack.style.transform = "scale(.65)";
		ttrack.style.position = "absolute"
		ttrack.style[((p-1)?"right":"left")] = 0;
		ttrack.style.bottom = "-100px"
	
		document.getElementById("P"+p).querySelectorAll(".card").forEach((c)=>{
			gid = c.getAttribute("gid")
			if(gid.includes("M")){
				c.setAttribute("pts",score(gid,p-1))
				addPts(score(gid,p-1),p)
				c.style.zIndex = 1;
				if(!(p==2&&Solo)){
					var k = tippy(c,{appendTo: 'parent',content:score(gid,p-1)})
					k.show()
				}
			}else{
				c.style.filter = "brightness(.3)"
			}
		})
	})
	document.getElementById("scoreBoard").style.display = 'inline-block';
	document.getElementById("scoreBoard").style.transform = '';
	
	BTN.childNodes[0].innerHTML = "Check Minority"
	BTN.style += ";position:absolute;left:0;right:0;bottom:-115px;";
	BTN.setAttribute("onclick","CheckMinority()")
	document.getElementById("scoreBoard").appendChild(BTN)

}

function CheckMinority(){
	[1,2].forEach((p)=>{
	
		document.getElementById("P"+p).querySelectorAll(".card").forEach((c)=>{
			gid = c.getAttribute("gid")
			if(gid.includes("L")){
				c.setAttribute("pts",score(gid,p-1))
				addPts(score(gid,p-1),p)
				c.style.zIndex = 1;
				c.style.filter = "unset"
				if(!(p==2&&Solo)){
					var k = tippy(c,{appendTo: 'parent',content:score(gid,p-1)})
					k.show()
				}
			}else if(gid.includes("M")){
				c.remove();
			}else{
				c.style.filter = "brightness(.3)"
			}
		})
	})

	BTN.childNodes[0].innerHTML = "Check Affinity"
	BTN.setAttribute("onclick","CheckAffinity()")
}

function CheckAffinity(){
	document.getElementById("scoreBoard").style.display = "none";
	document.getElementById("scoreHolder").style.display = "inline-block";

	[1,2].forEach((p)=>{	
		document.getElementById("P"+p).querySelectorAll(".card:not(.fakeCard)").forEach((c)=>{
			if(c.getAttribute("gid")) {
				let gid = c.getAttribute("gid")
				if(gid.includes("L")){
					c.remove();
				}else{
					c.style.filter = "unset"
					c.style.position= "unset"
					var atr=((gid[2]==undefined)?((Colors.includes(gid[1]))?gid[1]:gid[0]):((power[p-1][gid[2]]>power[p-1][gid[1]])?gid[1]:gid[2]))
					document.getElementById("S"+atr+p).appendChild(c)

					if(!(p==2&&Solo)){
						tippy(c,{appendTo: 'parent',content:score(gid,p-1)})
					}
					
					if(p==1){c.style.float = "right"}
				}
			}
		})
	});


	[...Colors,"K"].forEach((k)=>{
		while(document.getElementById("S"+k+1).childNodes.length!=document.getElementById("S"+k+2).childNodes.length){
			var fakeCard = document.createElement("div");
			fakeCard.classList.add("fakeCard","card");
			document.getElementById("S"+k+((document.getElementById("S"+k+2).childNodes.length>document.getElementById("S"+k+1).childNodes.length)?1:2)).appendChild(fakeCard)
		}
	})

	BTN.style.bottom  = "-7px";
	BTN.style.transform  = "scale(.8)";
	BTN.style.width  = "300px";
	BTN.style.margin  = "0 auto";
	BTN.childNodes[0].innerHTML = "Score <img style='height:45px;margin: -10px 15px; margin-right:0;' src='imgs/Y.svg'>"
	BTN.setAttribute("onclick","ScoreElement('Y')")
	document.getElementById("scoreHolder").appendChild(BTN)
}

function ScoreElement(e){
	
	document.querySelectorAll("[id^='tippy']").forEach(n=>{
		n.remove()
	})
	
	document.getElementById("scoreBoard").style.display = "inline-block";
	document.getElementById("scoreHolder").style.margin = "-35px 0 15px 0";

	[...Colors,"K"].forEach((c)=>{
		document.getElementById("score"+c).style.display="none";
	})
	document.getElementById("score"+e).style.display="inline-block";

	[1,2].forEach((p)=>{	
		if(!(p==2&&Solo)){
			document.getElementById("S"+e+p).querySelectorAll(".card:not(.fakeCard)").forEach((c)=>{
				gid = c.getAttribute("gid")
				addPts(score(gid,p-1),p)
				c._tippy.show()
			})
		}
	});

	BTN.style.bottom  = "-108px";
	BTN.style.transform  = "unset";
	BTN.style.width  = "unset";
	BTN.querySelector("img").src = "imgs/"+[...Colors,"K"][Colors.indexOf(e)+1]+".svg"
	BTN.setAttribute("onclick","ScoreElement('"+[...Colors,"K"][Colors.indexOf(e)+1]+"')")
	document.getElementById("scoreBoard").appendChild(BTN)
	
	if(e=="K"){
		BTN.childNodes[0].innerHTML = "Finish!!"
		BTN.setAttribute("onclick","Finish()")
	}
}

// ======================= [ SCORING ] =======================

function addPts(pts, player){
	let pawn = document.getElementById("Pawn"+player)
	var total = Number(pawn.getAttribute("pts")) + pts

	while (total > 100){
		temp = document.createElement("div")
		temp.classList.add("stone")
		document.getElementById("SH"+player).appendChild(temp)
		total -= 100
	}

	pawn.setAttribute("pts",total)
	
	total--
	
	
	pawn.style.top = (55*Math.floor(total/10) +21)+"px"
	pawn.style.left = (54*(total%10) +28)+"px"

	if(document.getElementById("Pawn1").getAttribute("pts")==document.getElementById("Pawn2").getAttribute("pts")){
		document.getElementById("Pawn1").classList.add("samepts")
		document.getElementById("Pawn2").classList.add("samepts")
	}else{
		document.getElementById("Pawn1").classList.remove("samepts")
		document.getElementById("Pawn2").classList.remove("samepts")
	}
}

function score(sCard,sPlayer){
	let cardColor = sCard.substring(0,1) ;
	let cardScore = sCard.substring(sCard.length-1);

	if(cardColor=="K"){
		switch (cardScore) {
//			case "S": return document.getElementById("SH"+(sPlayer+1)).childNodes.length*4
			case "S": return document.getElementById("SH"+(sPlayer+1)).getAttribute("stones")*4
			case "K": return power[sPlayer][cardScore]*2
			case "7": return 7
			case "3":
			case "4": return Object.values(power[sPlayer]).filter(value => value >= parseInt(cardScore)).length*parseInt(cardScore)
			case "6": 
				const {K,...temp} = power[sPlayer];
				return Math.min(...Object.values(temp))*6
			case "M": return Object.keys(power[sPlayer]).filter(key => power[sPlayer][key] > power[1-sPlayer][key]).length * 3
			case "L": return Object.keys(power[sPlayer]).filter(key => power[sPlayer][key] < power[1-sPlayer][key]).length * 3
		}
	}else if (Colors.includes(cardScore)){
		if (sCard.length==2){
			return power[sPlayer][cardScore]*2
		}else{
			return Math.min(power[sPlayer][cardScore],power[sPlayer][cardColor])*3
		}
	} else {
		if(["1","2"].includes(cardScore)){
			return power[sPlayer][cardColor]
		}else{
			return ((cardScore=="M")?((power[sPlayer][cardColor]>power[1-sPlayer][cardColor])?5:0):((power[sPlayer][cardColor]<power[1-sPlayer][cardColor])?6:0))
		}
	}
}

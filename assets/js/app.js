let row = 1;
let moves = 0;
let cardsDealt = 0;
let seconds = 0;
let handsPlayed = 0;
let handsWon = 0;
let timer;

function clearGlobal(){
	clearInterval(timer);
	row = 1;
	moves = 0;
	cardsDealt = 0;
	seconds = 0;
}
document.addEventListener('keydown', function(event) {
	if (event.code == 'KeyD') {
		gameStart();
	}
});

let container = document.createElement('div');
container.id = 'container';
document.body.prepend(container);

let gameArea = document.createElement('div');
gameArea.id = 'gameArea';
container.append(gameArea);

let scoreArea = document.createElement('div');
scoreArea.id = 'scoreArea';
container.append(scoreArea);

let scoreBlockTime = document.createElement('div');
scoreBlockTime.className = 'scoreBlock';
scoreArea.append(scoreBlockTime);

let scoreValueTime = document.createElement('span');
scoreValueTime.className = 'scoreValue';
scoreValueTime.innerText = '0:00';
scoreBlockTime.append(scoreValueTime);

let scoreBlockMoves = document.createElement('div');
scoreBlockMoves.className = 'scoreBlock';
scoreArea.append(scoreBlockMoves);

let scoreValueMoves = document.createElement('span');
scoreValueMoves.className = 'scoreValue';
scoreValueMoves.innerText = moves + ' moves';
scoreBlockMoves.append(scoreValueMoves);

gameStart();

function newCard(){
	row++;
	let tableau = document.getElementById('tableau');
	let cardBlock = tableau.getElementsByClassName('cardBlock');
	for(let i = 0; i < cardBlock.length; i++){
		let cards = cardBlock[i].getElementsByClassName('card');
		if(cards.length > 0){
			for(let j = 0; j < cards.length; j++){
				cards[j].removeEventListener('click', checkCard);
				cards[j].removeAttribute('draggable');
				cards[j].addEventListener('dragstart', function(){
					drag(event);
				});
			}
		}
		dealCards(0, cardBlock[i]);
	}
	increaseMoves();
}

function gameStart(){
	clearGlobal();
	shuffleCards(1, cards);
	handsPlayed++;
	gameArea.innerHTML = '';

	let gameAreaSpan = document.createElement('span');
	gameAreaSpan.id = 'gameAreaSpan';
	gameAreaSpan.innerText = 'Press D to deal again';
	gameArea.append(gameAreaSpan);

	let stockPile = document.createElement('div');
	stockPile.className = 'stockPile cardHidden';
	stockPile.addEventListener('click', newCard);
	gameArea.append(stockPile);

	let tableau = document.createElement('div');
	tableau.id = 'tableau';
	gameArea.append(tableau);

	for(let i = 0; i < 4; i++){
		let cardBlock = document.createElement('div');
		cardBlock.className = 'cardBlock';
		cardBlock.addEventListener('drop', function(){
			drop(event, 'tableau');
		});
		cardBlock.addEventListener('dragover', function(){
			allowDrop(event);
		});
		tableau.append(cardBlock);

		dealCards(0, cardBlock);
	}

	let foundation = document.createElement('div');
	foundation.id = 'foundation';
	foundation.className = 'cardBlock';
	foundation.addEventListener('drop', function(){
		drop(event, 'foundation');
	});
	foundation.addEventListener('dragover', function(){
		allowDrop(event);
	});
	gameArea.append(foundation);

	scoreValueTime.innerText = '0:00';
	scoreValueMoves.innerText = moves + ' moves';
}

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("card", ev.target.id);
}

function drop(ev, type) {
	let data = ev.dataTransfer.getData("card");
	let element = document.getElementById(data);
	if(type == 'foundation'){
		return checkCard(element, 'foundation');
	}
	let parent = element.closest('.cardBlock');
	let parentEl = parent.getElementsByClassName('card');

	let cardBlockParent = ev.target.closest('.cardBlock');
	let cardsEl = cardBlockParent.getElementsByClassName('card');

	if(cardsEl.length == 0){
		element.className = 'card';
		cardBlockParent.append(element);

		if(parent != null){
			let parentEl = parent.getElementsByClassName('card');
			if(parentEl.length > 0){
				parentEl[parentEl.length - 1].addEventListener('click', checkCard);
				parentEl[parentEl.length - 1].setAttribute('draggable', true);
				parentEl[parentEl.length - 1].addEventListener('dragstart', function(){
					drag(event);
				});
			}
		}
	}

	ev.preventDefault();

	increaseMoves();
}

function checkCard(el, type){
	increaseMoves();
	let suit = (type == 'foundation')? el.getAttribute('data-suit'): this.getAttribute('data-suit');
	let face = (type == 'foundation')? el.getAttribute('data-face'): this.getAttribute('data-face');
	let pos = cardPosition(face, 0);
	pos = (pos == 0)? 13 : pos;
	let tableau = document.getElementById('tableau');
	let cardBlocks = tableau.getElementsByClassName('cardBlock');
	for(let i = 0; i < cardBlocks.length; i++){
		let cardBlocksCards = cardBlocks[i].getElementsByClassName('card');
		if(cardBlocksCards.length != 0){
			let cbcSuit = cardBlocksCards[cardBlocksCards.length - 1].getAttribute('data-suit');
			let cbcFace = cardBlocksCards[cardBlocksCards.length - 1].getAttribute('data-face');
			let cbcPos = cardPosition(cbcFace, 0);
			cbcPos = (cbcPos == 0)? 13 : cbcPos;
			if(suit == cbcSuit && face != cbcFace){
				if(pos < cbcPos){
					return (type == 'foundation')? moveToFoundation(el) : moveToFoundation(this);
				}
			}
		}
	}
}

function moveToFoundation(el){
	let foundation = document.getElementById('foundation');
	let parent = el.closest('.cardBlock');
	let cards = parent.getElementsByClassName('card');
	if(cards.length > 1){
		cards[cards.length - 2].addEventListener('click', checkCard);
		cards[cards.length - 2].setAttribute('draggable', true);
		cards[cards.length - 2].addEventListener('dragstart', function(){
			drag(event);
		});
	}
	el.className = 'card';
	el.removeEventListener('click', checkCard);
	el.removeAttribute('draggable');
	foundation.append(el);
	checkWin();
}

function dealCards(count, playBlock){
	for(let i = 1; i <= (count + 1); i++){
		let colourClass = (cards[cardsDealt].suit == 'heart' || cards[cardsDealt].suit == 'diamond')? ' red' : ' black';
		let playBlockCards = playBlock.getElementsByClassName('card');
		let topClass = (cardsDealt > 3)? ' topClass' + (playBlockCards.length + 1) : '';
		let card = document.createElement('div');
		card.className = 'card' + topClass;
		card.id = cards[cardsDealt].suit + cards[cardsDealt].face;
		card.setAttribute('data-id', cardsDealt);
		card.setAttribute('data-face', cards[cardsDealt].face);
		card.setAttribute('data-suit', cards[cardsDealt].suit);
		card.setAttribute('draggable', true);
		card.addEventListener('dragstart', function(){
			drag(event);
		});

		card.addEventListener('click', checkCard);
		playBlock.append(card);

		let numberTop = document.createElement('div');
		numberTop.className = 'number-top' + colourClass;
		numberTop.innerText = cards[cardsDealt].face;
		card.append(numberTop);

		let suitTop = document.createElement('div');
		suitTop.className = 'suit-top';
		card.append(suitTop);

		let suitTopEl = document.createElement('div');
		suitTopEl.className = cards[cardsDealt].suit;
		suitTop.append(suitTopEl);

		let suitCentre = document.createElement('div');
		suitCentre.className = 'suit-centre';
		card.append(suitCentre);

		if(cards[cardsDealt].face != 'J' && cards[cardsDealt].face != 'Q' && cards[cardsDealt].face != 'K' && cards[cardsDealt].face != 'A'){
			for(let k = 0; k < parseInt(cards[cardsDealt].face); k++){
				let suitEl = document.createElement('div');
				suitEl.className = cards[cardsDealt].suit + ' ' + cards[cardsDealt].suitClass + '-' + suitCentreClasses[k];
				suitCentre.append(suitEl);
			}
		}else{
			let suitEl = document.createElement('div');
			suitEl.className = cards[cardsDealt].suitClass + ' ' + cards[cardsDealt].suitCentreClass;
			suitEl.innerText = cards[cardsDealt].face;
			suitCentre.append(suitEl);
		}

		let numberBottom = document.createElement('div');
		numberBottom.className = 'number-bottom';
		numberBottom.innerText = cards[cardsDealt].face;
		card.append(numberBottom);

		let suitBottom = document.createElement('div');
		suitBottom.className = 'suit-bottom';
		card.append(suitBottom);

		let suitBottomEl = document.createElement('div');
		suitBottomEl.className = cards[cardsDealt].suit;
		suitBottom.append(suitBottomEl);

		cardsDealt++;

		if(cardsDealt >= cards.length){
			let stockPile = document.getElementsByClassName('stockPile')[0];
			stockPile.className = 'stockPile';
			let span = document.createElement('span');
			span.className = 'ncbSpan';
			span.innerText = '0';
			stockPile.append(span);
			stockPile.removeEventListener('click', newCard);
		}
	}
}

function checkWin(){
	let foundation = document.getElementById('foundation');
	let foundationCards = foundation.getElementsByClassName('card');
	if(foundationCards.length == 48){
		return gameWin(foundation);
	}
}

function gameWin(cardBlockParent){
	clearInterval(timer);
	handsWon++;

	setTimeout(function(){
		displayModel();
	}, 100);
}

function increaseMoves(){
	moves++;
	document.getElementsByClassName('scoreValue')[1].innerText = moves + ' moves';
	if(moves == 1){
		startTimer();
	}
}

function timerConvert(ms) {
	let minutes = Math.floor(ms / 60000);
	let seconds = ((ms % 60000) / 1000).toFixed(0);
	return (seconds == 60)? (minutes + 1) + ':00' : minutes + ':' + ((seconds < 10)? '0' : '') + seconds;
}

function startTimer(){
	timer = setInterval(function() {
		seconds = seconds + 1000;
		document.getElementsByClassName('scoreValue')[0].innerText = timerConvert(seconds);
	}, 1000);
}

function displayModel(){
	let shadowBack = document.createElement('div');
	shadowBack.id = 'shadowBack';
	gameArea.append(shadowBack);

	let model = document.createElement('div');
	model.id = 'model';
	shadowBack.append(model);

	let modelConent = document.createElement('div');
	modelConent.id = 'modelConent';
	model.append(modelConent);

	let modelSpan = document.createElement('span');
	modelSpan.id = 'modelSpan';
	modelSpan.innerText = 'Congratulations, you won!';
	modelConent.append(modelSpan);

	let modelScoreBlock = document.createElement('div');
	modelScoreBlock.id = 'modelScoreBlock';
	modelConent.append(modelScoreBlock);

	let playedSpan = document.createElement('span');
	playedSpan.className = 'scoreSpan';
	playedSpan.innerText = 'Hands played: ' + handsPlayed;
	modelScoreBlock.append(playedSpan);

	let wonSpan = document.createElement('span');
	wonSpan.className = 'scoreSpan';
	wonSpan.innerText = 'Hands won: ' + handsWon;
	modelScoreBlock.append(wonSpan);

	let modelBtn = document.createElement('btn');
	modelBtn.id = 'modelBtn';
	modelBtn.innerText = 'Play again';
	modelBtn.addEventListener('click', function(){
		fadeOut(shadowBack, 500);
		setTimeout(function(){
			gameStart();
		}, 200);
	});
	modelConent.append(modelBtn);
	setTimeout(function(){
		shadowBack.style.cssText = 'opacity:1';
	}, 1);
}

function fadeIn(el, time){
	el.style.cssText = 'opacity:1';
	setTimeout(function(){
		el.removeAttribute('style');
	}, time);
}

function fadeOut(el, time){
	el.style.cssText = 'opacity:0;';
	setTimeout(function(){
		el.innerHTML = '';
	}, time);
}
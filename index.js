const setup = async () => {
  let firstCard = undefined;
  let secondCard = undefined;
  let numPairs = 0;
  let pairsMatched = 0;
  let clicks = 0;
  let gameStarted = false;
  let powerUpActive = false;
  let timerInterval = undefined;
  
  const baseURL = 'https://pokeapi.co/api/v2/pokemon';
  const cardImages = [];
  const cardNames = [];
  
  const fetchRandomPokemon = async () => {
    try {
      const response = await fetch(`${baseURL}?limit=${numPairs}`);
      const data = await response.json();
      const randomPokemon = getRandomElements(data.results, numPairs);
      
      for (let i = 0; i < numPairs; i++) {
        const pokemon = randomPokemon[i];
        const pokemonURL = pokemon.url;
        
        const pokemonResponse = await fetch(pokemonURL);
        const pokemonData = await pokemonResponse.json();
        
        const pokemonName = pokemonData.name;
        const pokemonImage = pokemonData.sprites.front_default;
        
        cardNames.push(pokemonName);
        cardImages.push(pokemonImage);
        cardNames.push(pokemonName);
        cardImages.push(pokemonImage);
      }
      
      shuffleArray(cardImages);
      populateCards();
    } catch (error) {
      console.log('Error fetching random Pokémon:', error);
    }
  };
  
  const getRandomElements = (array, numElements) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numElements);
  };
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  const populateCards = () => {
    const gameGrid = $('#game_grid');
    gameGrid.empty();
    
    for (let i = 0; i < numPairs * 2; i++) {
      const card = $('<div>').addClass('card');
      const frontFace = $('<img>').addClass('front_face');
      const backFace = $('<img>').addClass('back_face').attr('src', 'back.webp');
      
      frontFace.attr('src', cardImages[i]);
      card.attr('data-pokemon-name', cardNames[i]);
      
      card.append(frontFace);
      card.append(backFace);
      
      gameGrid.append(card);
    }
    
    addCardClickListeners();
  };
  
  const addCardClickListeners = () => {
    $('.card').on('click', function() {
      if (!gameStarted) {
        startTimer();
        gameStarted = true;
      }
      
      if ($(this).hasClass('flip') || $(this).hasClass('matched')) {
        return;
      }
      
      $(this).toggleClass('flip');
      const clickedCard = $(this).attr('data-pokemon-name');
      
      if (!firstCard) {
        firstCard = clickedCard;
      } else {
        secondCard = clickedCard;
        clicks++;
        
        $('.clicks').text(clicks);
        
        if (firstCard === secondCard) {
          pairsMatched++;
          $('.pairs-matched').text(pairsMatched);
          
          $(`.card[data-pokemon-name="${firstCard}"]`).addClass('matched');
          $(`.card[data-pokemon-name="${secondCard}"]`).addClass('matched');
          
          if (pairsMatched === numPairs) {
            stopTimer();
            showWinningMessage();
          }
        } else {
          setTimeout(() => {
            $(`.card[data-pokemon-name="${firstCard}"]`).removeClass('flip');
            $(`.card[data-pokemon-name="${secondCard}"]`).removeClass('flip');
          }, 1000);
        }
        
        firstCard = undefined;
        secondCard = undefined;
      }
    });
  };
  
  const startTimer = () => {
    const startTime = new Date().getTime();
    
    timerInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - startTime;
      
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);
      
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
      
      $('.timer').text(`${minutesStr}:${secondsStr}`);
    }, 1000);
  };
  
  const stopTimer = () => {
    clearInterval(timerInterval);
  };
  
  const showWinningMessage = () => {
    alert('Congratulations! You won the game!');
  };
  
  const startGame = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        numPairs = 3;
        break;
      case 'medium':
        numPairs = 6;
        break;
      case 'hard':
        numPairs = 9;
        break;
      default:
        numPairs = 3;
    }
    
    fetchRandomPokemon();
    resetGame();
  };
  
  const resetGame = () => {
    firstCard = undefined;
    secondCard = undefined;
    pairsMatched = 0;
    clicks = 0;
    gameStarted = false;
    powerUpActive = false;
    
    $('.clicks').text(clicks);
    $('.pairs-matched').text(pairsMatched);
    $('.pairs-left').text(numPairs);
    $('.timer').text('00:00');
    
    stopTimer();
    
    $('.card').removeClass('flip matched');
  };
  
  const applyTheme = (theme) => {
    $('body').removeClass().addClass(theme);
  };
  
  const activatePowerUp = () => {
    if (!powerUpActive) {
      $('.card').addClass('flip');
      setTimeout(() => {
        $('.card').removeClass('flip');
        powerUpActive = false;
      }, 3000);
      
      powerUpActive = true;
    }
  };
  
  $(document).ready(() => {
    $('.start-button').on('click', () => {
      const selectedDifficulty = $('.difficulty-levels').val();
      startGame(selectedDifficulty);
    });

    $('.reset-button').on('click', resetGame);

    $('.theme-selector').on('change', () => {
      const selectedTheme = $('.theme-selector').val();
      applyTheme(selectedTheme);
    });

    $('.power-up-button').on('click', activatePowerUp);
  });
};

$(document).ready(setup);

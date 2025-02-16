document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('pokemonSearchForm');
    const pokemonInput = document.getElementById('pokemonInput');
    const pokemonDetails = document.getElementById('pokemonDetails');
    const categoriesContainer = document.querySelector('.categories');
    const watchSection = document.querySelector('.watch-section');
    const favoritesContainer = document.querySelector('.favorites-list');

    // Initialize favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('pokemonFavorites')) || [];
    let currentPokemon = null;

    async function searchPokemon(pokemonName) {
        try {
            pokemonDetails.classList.add('loading');
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            if (!response.ok) throw new Error('Pokemon not found');

            const data = await response.json();
            currentPokemon = data;

            // Show categories and hide watch section
            categoriesContainer.style.display = 'grid';
            watchSection.style.display = 'none';
            pokemonDetails.style.display = 'none';

            // Show basic info in the header
            updatePokemonHeader(data);

        } catch (error) {
            showError(error.message);
            currentPokemon = null;
            // Show categories and watch section back if there's an error
            categoriesContainer.style.display = 'grid';
            watchSection.style.display = 'block';
        } finally {
            pokemonDetails.classList.remove('loading');
        }
    }

    function updatePokemonHeader(pokemon) {
        const header = document.querySelector('.search-container h1');
        header.innerHTML = `
            <div class="pokemon-header-info">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-mini-sprite">
                <span>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
                <button class="favorite-button" onclick="toggleFavorite(${JSON.stringify(pokemon)})">
                    <i class="fa-${favorites.some(f => f.id === pokemon.id) ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>
        `;
    }

    // Category click handlers
    document.querySelector('.category-card.pokedex').addEventListener('click', function() {
        if (!currentPokemon) return;
        showPokedexDetails(currentPokemon);
    });

    document.querySelector('.category-card.evolutions').addEventListener('click', function() {
        if (!currentPokemon) return;
        showEvolutionDetails(currentPokemon.id);
    });

    document.querySelector('.category-card.locations').addEventListener('click', async function() {
        if (!currentPokemon) return;
        showLocationDetails(currentPokemon.id);
    });

    function showPokedexDetails(pokemon) {
        pokemonDetails.style.display = 'block';
        pokemonDetails.innerHTML = `
            <section>
                <div class="details">
                    <div class="pokemon-image-container">
                        <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                             alt="${pokemon.name}" id="pokemonImage">
                    </div>
                    <div class="pokemon-info">
                        <div id="types" class="flex gap-2 justify-center">
                            ${pokemon.types.map(type => 
                                `<span class="type-badge">${type.type.name}</span>`
                            ).join('')}
                        </div>
                        <div id="stats" class="stats-grid">
                            ${pokemon.stats.map(stat => `
                                <div class="stat">
                                    <div class="stat-name">${stat.stat.name}</div>
                                    <div class="stat-value">${stat.base_stat}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div id="attacks">
                            <h2>Attacks</h2>
                            <ul>
                                ${pokemon.moves.slice(0, 12).map(move => 
                                    `<li>${move.move.name.replace('-', ' ')}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    async function showEvolutionDetails(pokemonId) {
        pokemonDetails.style.display = 'block';
        pokemonDetails.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const speciesData = await speciesResponse.json();

            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();

            pokemonDetails.innerHTML = `
                <section>
                    <div class="evolution-chain" id="evolutionChain"></div>
                </section>
            `;

            await displayEvolutionChain(evolutionData.chain, document.getElementById('evolutionChain'));
        } catch (error) {
            showError('Error loading evolution data');
        }
    }

    async function showLocationDetails(pokemonId) {
        pokemonDetails.style.display = 'block';
        pokemonDetails.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
            const locations = await response.json();

            pokemonDetails.innerHTML = `
                <section>
                    <div class="locations-list">
                        <h2>Found in Locations:</h2>
                        ${locations.length ? locations.map(loc => `
                            <div class="location-item">
                                <i class="fas fa-map-marker-alt"></i>
                                ${loc.location_area.name.replace('-', ' ')}
                            </div>
                        `).join('') : '<p>No location data available</p>'}
                    </div>
                </section>
            `;
        } catch (error) {
            showError('Error loading location data');
        }
    }

    // Rest of the code (searchForm event listener, toggleFavorite, etc.) remains the same
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const pokemonName = pokemonInput.value.toLowerCase().trim();
        if (!pokemonName) return;
        await searchPokemon(pokemonName);
    });

    // Clear search handler
    pokemonInput.addEventListener('input', function(e) {
        if (e.target.value === '') {
            document.querySelector('.search-container h1').textContent = 'What Pokemon are you looking for?';
            categoriesContainer.style.display = 'grid';
            watchSection.style.display = 'block';
            pokemonDetails.style.display = 'none';
            currentPokemon = null;
        }
    });

    // Favorites functionality
    function toggleFavorite(pokemon) {
        const index = favorites.findIndex(fav => fav.id === pokemon.id);
        if (index === -1) {
            favorites.push({
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
            });
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
        updatePokemonHeader(pokemon);
        updateFavoritesList();
    }

    function updateFavoritesList() {
        if (favoritesContainer) {
            favoritesContainer.innerHTML = `
                <h2>Your Favorite Pokemon</h2>
                ${favorites.map(pokemon => `
                    <div class="favorite-card" onclick="searchPokemon('${pokemon.name}')">
                        <img src="${pokemon.image}" alt="${pokemon.name}">
                        <span>${pokemon.name}</span>
                    </div>
                `).join('')}
            `;
        }
    }

    // Initialize favorites list
    updateFavoritesList();

    // Favorites navigation
    document.querySelector('.nav_opt a[href="#favorites"]').addEventListener('click', function(e) {
        e.preventDefault();
        pokemonDetails.style.display = 'none';
        categoriesContainer.style.display = 'none';
        watchSection.style.display = 'none';
        favoritesContainer.style.display = 'grid';
    });

    async function displayEvolutionChain(chain, container) {
        if (!chain) return;

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${chain.species.name}`);
            const pokemon = await response.json();

            const evolutionCard = document.createElement('div');
            evolutionCard.className = 'evolution-card';
            evolutionCard.style.cursor = 'pointer';
            evolutionCard.addEventListener('click', () => searchPokemon(pokemon.name));

            evolutionCard.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <div>${pokemon.name}</div>
            `;

            container.appendChild(evolutionCard);

            if (chain.evolves_to.length > 0) {
                await displayEvolutionChain(chain.evolves_to[0], container);
            }
        } catch (error) {
            console.error('Error displaying evolution:', error);
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message fade-in';
        errorDiv.textContent = message;

        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        document.querySelector('.search-container').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
});
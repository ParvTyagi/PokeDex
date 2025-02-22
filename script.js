document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.createElement("button");
    toggleButton.style.position = "fixed";
    toggleButton.style.top = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.padding = "10px 15px";
    toggleButton.style.borderRadius = "8px";
    toggleButton.style.border = "none";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.transition = "background-color 0.3s ease, color 0.3s ease";
    document.body.appendChild(toggleButton);

    function updateButtonStyle() {
        if (document.body.classList.contains("light-mode")) {
            toggleButton.style.backgroundColor = "rgba(181, 104, 72, 0.57)";  // Dark red for contrast
            toggleButton.style.color = "white";
            toggleButton.textContent = " 🌞 Light Mode"; // Sun symbol
        } else {
            toggleButton.style.backgroundColor = "#ddd";  // Light gray for dark mode
            toggleButton.style.color = "black";
            toggleButton.textContent = " 🌙 Dark Mode"; // Moon symbol
        }
    }

    // Load saved theme preference
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
    }
    updateButtonStyle(); // Apply correct button style on load

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");

        // Save preference
        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }

        updateButtonStyle(); // Update button styles dynamically
    });
});

const style = document.createElement("style");
style.innerHTML = `
    .light-mode {
        background: rgb(251, 223, 173) !important;
        transition: background 0.3s ease, color 0.3s ease;
    }
    .light-mode * {
        color: black !important;
    }
    .light-mode .nav_bar {
        background: rgba(138, 50, 50, 0.13) !important;
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);
    }
    .light-mode .nav_opt {
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);    
    }
    .light-mode .nav_opt:hover {
        background-color: rgb(251, 223, 173) !important;
    }
    .light-mode .search-container {
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);
        background: rgba(138, 50, 50, 0.13) !important;
        border: 1px solid #ccc !important;
        padding: 10px;
        border-radius: 25px;
    }
    .light-mode .search-container input {
        background: #fff !important;
        border: 1px solid #ddd !important;
        padding: 8px;
        border-radius: 5px;
    }
    .light-mode .category-card {
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);
    }
    .light-mode .stats-grid,
    .light-mode .move-card,
    .light-mode .location-card,
    .light-mode .evolution-card {
        background: rgba(138, 50, 50, 0.1);
    }
`;
document.head.appendChild(style);

    
document.addEventListener('DOMContentLoaded', function () {
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
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
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

        // Add click event for favorite button
        const favoriteButton = header.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(pokemon);
        });
    }

    // Category click handlers
    document.querySelector('.category-card.pokedex').addEventListener('click', function () {
        if (!currentPokemon) return;
        showPokedexDetails(currentPokemon);
    });

    document.querySelector('.category-card.moves').addEventListener('click', function () {
        if (!currentPokemon) return;
        showMoveDetails(currentPokemon);
    });

    document.querySelector('.category-card.evolutions').addEventListener('click', function () {
        if (!currentPokemon) return;
        showEvolutionDetails(currentPokemon.id);
    });

    document.querySelector('.category-card.locations').addEventListener('click', function () {
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
                    </div>
                </div>
            </section>
        `;
    }

    async function showMoveDetails(pokemon) {
        pokemonDetails.style.display = 'block';
        pokemonDetails.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const movePromises = pokemon.moves.slice(0, 12).map(async move => {
                const response = await fetch(move.move.url);
                return await response.json();
            });

            const moves = await Promise.all(movePromises);

            pokemonDetails.innerHTML = `
                <section>
                    <h2>Moves</h2>
                    <div class="moves-grid">
                        ${moves.map(move => `
                            <div class="move-card">
                                <h3>${move.name.replace('-', ' ')}</h3>
                                <div class="move-details">
                                    <p>Power: ${move.power || 'N/A'}</p>
                                    <p>Accuracy: ${move.accuracy || 'N/A'}</p>
                                    <p>PP: ${move.pp}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        } catch (error) {
            showError('Error loading move details');
        }
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
                    <h2>Evolution Chain</h2>
                    <div class="evolution-chain"></div>
                </section>
            `;

            const chain = evolutionData.chain;
            const evolutionChainDiv = pokemonDetails.querySelector('.evolution-chain');
            await displayEvolutionChain(chain, evolutionChainDiv);
        } catch (error) {
            showError('Error loading evolution data');
        }
    }

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
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'evolution-arrow';
                arrowDiv.innerHTML = '<i class="fas fa-arrow-right"></i>';
                container.appendChild(arrowDiv);
                await displayEvolutionChain(chain.evolves_to[0], container);
            }
        } catch (error) {
            console.error('Error displaying evolution:', error);
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
                    <h2>Locations</h2>
                    <div class="locations-grid">
                        ${locations.length ? locations.map(loc => `
                            <div class="location-card">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${loc.location_area.name.replace(/-/g, ' ')}</span>
                            </div>
                        `).join('') : '<p class="no-locations">No location data available</p>'}
                    </div>
                </section>
            `;
        } catch (error) {
            showError('Error loading location data');
        }
    }

    // Favorites functionality
    window.toggleFavorite = function (pokemon) {
        const index = favorites.findIndex(f => f.id === pokemon.id);
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
    };

    function updateFavoritesList() {
        if (favoritesContainer) {
            favoritesContainer.innerHTML = `
                <h2>Your Favorite Pokemon</h2>
                <div class="favorites-grid">
                    ${favorites.map(pokemon => `
                        <div class="favorite-card" onclick="searchPokemon('${pokemon.name}')">
                            <img src="${pokemon.image}" alt="${pokemon.name}">
                            <span>${pokemon.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Initialize favorites list
    updateFavoritesList();

    // Search form handler
    searchForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const pokemonName = pokemonInput.value.toLowerCase().trim();
        if (!pokemonName) return;
        await searchPokemon(pokemonName);
    });

    // Clear search handler
    pokemonInput.addEventListener('input', function (e) {
        if (e.target.value === '') {
            document.querySelector('.search-container h1').textContent = 'What Pokemon are you looking for?';
            categoriesContainer.style.display = 'grid';
            watchSection.style.display = 'block';
            pokemonDetails.style.display = 'none';
            currentPokemon = null;
        }
    });

    // Navigation
    document.querySelector('.nav_opt a[href="#favorites"]').addEventListener('click', function (e) {
        e.preventDefault();
        pokemonDetails.style.display = 'none';
        categoriesContainer.style.display = 'none';
        watchSection.style.display = 'none';
        favoritesContainer.style.display = 'grid';
    });

    document.querySelector('.nav_opt a[href="#"]').addEventListener('click', function (e) {
        e.preventDefault();
        pokemonDetails.style.display = 'none';
        categoriesContainer.style.display = 'grid';
        watchSection.style.display = 'block';
        favoritesContainer.style.display = 'none';
    });

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
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }

const contorlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    // ode u view, odradi funk koja je u zagradi, i onda zameni samo html zbog selektovanog recepta
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recepie
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    //resultsView.render(model.state.search.results); FOR ALL RESULTS
    resultsView.render(model.getSearchResultsPage());

    // 4) Render inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// Na pocetku se dugmad sama louduju, i preko ove funk se dodeljuje addEventListener, koji stalno funkcionise nakon samo jednog poziva ove funk, to je funk u funk,time se dodeljuju dugmatidma dataset, koji se kasnije cita, i pomera za jednu str
const controlPagination = function (goToPage) {
  // 3) Render NEW results
  //resultsView.render(model.state.search.results); FOR ALL RESULTS
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update recipe survings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('.', err);
    addRecipeView.renderError(err.message);
  }
};

// Funkcija u funkciji, lekcija
// Funk je pokrenuta, a druga funk je event, i ona ce se stalno moci izvrsavati
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  // Za hash i load
  recipeView.addHandlerRender(contorlRecipes);
  // Kada povecamo porcije
  recipeView.addHandlerUpdateServings(controlServings);
  // Za cuvanje, bookmark
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  // Za search
  searchView.addHandlerSearch(controlSearchResults);
  // Za klik na dugme kod str
  paginationView.addHandlerClick(controlPagination);
  // Za uploudovanje
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

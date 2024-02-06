"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();    //
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */




function generateStoryMarkup(story,showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = !!(currentUser);
  return $(`
      <li id="${story.storyId}">
       <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story,currentUser): ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

function getDeleteBtnHTML(){
  const spamEl = document.createElement("span");
  spamEl.classList.add("trash-can");
  const iconEl = document.createElement("i");
  iconEl.classList.add("fas", "fa-trash-alt");
  spamEl.appendChild(iconEl);

   return spamEl.outerHTML;
}

function getStarHTML(story,user){
 const isFavorite = user.isFavorite(story);
 const starType = isFavorite ? "fas" : "far";
 const starSpan = document.createElement("span");
 starSpan.classList.add("star");
 const starI = document.createElement("i");
 starI.classList.add(`${starType}`, "fa-star")
 starSpan.appendChild(starI);
//console.log(starSpan);
 //document.getElementsByClassName("storyconty").appendChild(starSpan);
 return starSpan.outerHTML;
        
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt){
  console.debug("deleteStory");
  const $closestLi = $(evt.target).closest("li");
  //const closestLi = $(evt.target).closest(`li[id="${story.storyId}"]`)
  //const storyId = $closestLi.getAttribute("id");
  const storyId = $closestLi.attr("id");
  console.log("storyId:", storyId);
  await storyList.removeStory(currentUser,storyId);
  await putUserStoriesOnPage();
}
$ownStories.on('click',".trash-can",deleteStory);


async function submitNewStory(evt){
  console.debug("submitNewStory");
  evt.preventDefault();
  const titleInput= document.getElementById("create-title");
  const title = titleInput.value;
  const urlInput = document.getElementById("create-url");
  const url = urlInput.value;
  const authorInput = document.getElementById("create-author")
  const author = authorInput.value
  const username = currentUser.username;
  const storyData = {title,url,author,username};

  const story = await storyList.addStory(currentUser,storyData);

  const storyMarkup = generateStoryMarkup(story)
  $allStoriesList.prepend(storyMarkup);
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}
$submitForm.on("submit",submitNewStory);


function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");
  $ownStories.empty(); //clears
  if(currentUser.ownStories.length === 0){
    const h5 = document.createElement("h5")
    h5.innerText = "No stories by user";
    $ownStories.append(h5);
  }else{
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story,true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
  //return Promise.resolve();
}

function putFavoritesListOnPage(){
  console.debug("putFavoritesListOnPage");
  $favoritedStories.empty();
  if(currentUser.favorites.length ===0){
    const h5f = document.createElement("h5")
    h5f.innerText = "No favorites by user";
    $favoritedStories.append(h5f);
  }else{
    for(let story of currentUser.favorites){
      const favStory = generateStoryMarkup(story);
      $favoritedStories.append(favStory);
    }
  }
  $favoritedStories.show();
}

async function toggleStoryFavorite(evt){
  console.debug("toggleStoryFavorite");
  const $trgt = $(evt.target);
  const $closestLi = $trgt.closest("li");
  const storyIdv = $closestLi.attr("id");
  const story = storyList.stories.find(s=> s.storyId === storyIdv);
  if($trgt.hasClass("fas")){
    await currentUser.removeFavorite(story);
    $trgt.closest("i").toggleClass("fas far");
  }else{
    await currentUser.addFavorite(story);
    $trgt.closest("i").toggleClass("fas far");
  }
}
$storiesLists.on("click",".star",toggleStoryFavorite);
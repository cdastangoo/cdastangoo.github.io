// render browser dependent text
const renderBrowserInfo = () => {
  if (isMobile() || !isBrowserSupported()) {
    const $info = $("<div>").addClass("info");
    $info.append($("<i>").addClass("fas fa-circle-info"));
    const infoText = isMobile()
      ? "Some features here are experimental. For the best experience, use Chrome or Edge in desktop mode."
      : "Some features of this website are experimental. For the best experience, please use Chrome or Edge.";
    const $text = $("<p>").addClass("glass").text(infoText);
    $info.append($text);
    $('.header-content').append($info);
  }
};

// render skill data
const renderSkillData = (skillData) => {
  const $skills = $('.skills-container');
  skillData.forEach((skill, idx) => {
    const { name, description, skills, brackets, icon, image } = skill;
    const id = name.toLowerCase().split(' ').join('-');

    const $skill = $("<div>").addClass("skill-card").attr('id', id);

    const $image = $("<div>").addClass("card-img").css('background-image', `url("../assets/img/${image}")`);
    $skill.append($image);
    $skill.append($("<div>").addClass("card-overlay"));

    const $content = $("<div>").addClass("card-content");
    $content.append($("<i>").addClass("card-icon").addClass(`fas fa-${icon}`));
    $content.append($("<h2>").text(name));
    $content.append($("<p>").text(description));
    $content.append($("<p>").addClass("code").text(`${brackets[0]} ${skills.join(', ')} ${brackets[1]}`));
    $skill.append($content);

    $skills.append($skill);

    if (isMobile()) {
      if (idx === 2 && skillData.length > 3) {
        const $expand = $("<button>").addClass("btn expand-btn").attr('id', 'skills-expand').text("See More...");
        $skills.append($expand);
      }
      else if (idx > 2) {
        $skill.addClass('hidden');
      }
    } 
  });
};

// render language data
const renderLanguageData = (languageData) => {
  const $languages = $('.languages');
  const levels = $languages.children().toArray();
  $languages.children().each((_idx, elem) => {
    const $level = $(elem);
    const level = $level.attr('id');
    const languages = languageData.filter(language => language.level === level);

    languages.forEach(language => {
      const { name, skills, progress, icon } = language;
      const id = name.toLowerCase();

      // create container divs
      const $container = $("<div>").addClass("language-container");
      $container.attr('id', `language-${id}`);
      const $language = $("<div>").addClass("language");

      // create icon and label
      const $languageName = $("<div>").addClass("language-name glass");
      const $icon = $("<i>").addClass("language-icon").addClass(icon);
      const $name = $("<p>").text(name);
      $languageName.append($icon);
      $languageName.append($name);

      // create progress bar
      const $progress = $("<progress>").attr({
        id: `progress-${id}`,
        value: progress,
        max: "100",
      });
      $language.append($languageName);
      $language.append($progress);
      $container.append($language);

      // create skill bullets
      const $skills = $("<div>").addClass("skills");
      skills.forEach(skill => {
        const $skill = $("<p>").text(skill);
        $skills.append($skill);
      });
      $container.append($skills);

      $level.append($container);
    });
  });
};

// render experience data
const renderExperienceData = (experienceData) => {
  const $accordions = $('.accordion-wrapper');
  experienceData.forEach((job, idx) => {
    const { company, position, location, link, url, dates, bullets, skills } = job;
    const isDefault = idx === 0;

    const id = company.toLowerCase().split(' ')[0];
    const title = `${position ? `${position} @ ` : ''}${company}`;

    const $accordion = $("<div>").addClass("accordion").attr('id', id);
    if (isDefault) {
      $accordion.addClass("open");
    }

    // create accordion header
    const $header = $("<div>").addClass("accordion-header");
    $header.append($("<h4>").text(title));
    $header.append($("<h4>").text(isDefault ? '-' : '+'));
    $accordion.append($header);

    const $content = $("<div>").addClass("accordion-content");

    // create job location, link, dates tags
    const $info = $("<div>").addClass("job-info");
    if (location) {
      const $location = $("<span>");
      $location.append($("<i>").addClass("fas fa-location-dot"));
      $location.append($("<p>").text(location));
      $info.append($location);
    }
    if (link && url) {
      const $link = $("<span>");
      $link.append($("<i>").addClass("fas fa-arrow-up-right-from-square"));
      const $url = $("<a>").text(link).attr({
        "href": url,
        "target": "_blank",
        "rel": "noopener noreferrer",
      });
      $link.append($url);
      $info.append($link);
    }
    if (dates) {
      const $dates = $("<span>");
      $dates.append($("<i>").addClass("fas fa-calendar"));
      $dates.append($("<p>").text(dates));
      $info.append($dates);
    }
    $content.append($info);

    // create job bullets
    const $bullets = $("<ul>");
    bullets.forEach(bullet => {
      $bullets.append($("<li>").text(bullet));
    });
    $content.append($bullets);

    // create job skills
    const $skills = $("<div>").addClass("skills");
    skills.forEach(skill => {
      $skills.append($("<p>").text(skill));
    });
    $content.append($skills);

    $accordion.append($content);
    $accordions.append($accordion);
  });
};

// render project data
const renderProjectData = (projectData) => {
  const $cards = $('.project-cards');
  const $carousel = $('.carousel-track');
  const $modals = $('.modals');
  projectData.forEach((project, idx) => {
    const { title, category, description, image, live, source, stack, tags } = project;
    const id = title.toLowerCase().split(' ').join('-');

    // create project carousel card
    const $card = $("<div>").addClass("project-card").attr('id', id);
    const $cardImg = $("<div>").addClass("project-card-img");
    $cardImg.css('background-image', `url("../assets/img/portfolio/${image}")`);
    $cardImg.append($("<div>").addClass("card-overlay"));
    $card.append($cardImg);
    $card.append($("<h4>").text(title));
    $cards.append($card);

    const initialLimit = isMobile() ? 3 : 6;
    if (idx === initialLimit - 1 && projectData.length > initialLimit) {
      const $expand = $("<button>").addClass("btn expand-btn").attr('id', 'projects-expand').text("See More...");
      $cards.append($expand);
    }
    else if (idx >= initialLimit) {
      $card.addClass('hidden');
    }
    
    // create project modal
    const $modal = $("<div>").addClass("modal").attr('id', id);
    $modal.append($("<div>").addClass("modal-background"));
    const $wrapper = $("<div>").addClass("modal-wrapper");
    const $container = $("<div>").addClass("modal-container");

    // create close button
    const $closeButton = $("<button>").addClass("modal-close btn-close");
    $closeButton.append($("<i>").addClass("close-icon fas fa-x"));
    $container.append($closeButton);

    const $content = $("<div>").addClass("modal-content");
    $content.append($("<h2>").text(title));

    // create modal image
    if (image) {
      const $modalImg = $("<a>").addClass("modal-img");
      const imgUrl = live || source || "";
      $modalImg.attr({
        "href": imgUrl,
        "target": "_blank",
        "rel": "noopener noreferrer",
      });
      $modalImg.css('background-image', `url("../assets/img/portfolio/${image}")`);
      $content.append($modalImg);
    }

    $content.append($("<h4>").text(category));

    // create modal skills
    const $skills = $("<div>").addClass("skills");
    stack.forEach(skill => {
      $skills.append($("<p>").text(skill));
    });
    $content.append($skills);

    $content.append($("<p>").text(description));

    // create modal links
    if (live || source) {
      const $links = $("<div>").addClass("links");
      if (live) {
        const $live = $("<a>").addClass("modal-link btn").attr({
          "href": live,
          "target": "_blank",
          "rel": "noopener noreferrer",
        });
        $live.append($("<i>").addClass("fas fa-arrow-up-right-from-square"));
        $live.append($("<span>").text('View Live'));
        $links.append($live);
      }
      if (source) {
        const $source = $("<a>").addClass("modal-link btn").attr({
          "href": source,
          "target": "_blank",
          "rel": "noopener noreferrer",
        });
        $source.append($("<i>").addClass("fas fa-code"));
        $source.append($("<span>").text('Source Code'));
        $links.append($source);
      }
      $content.append($links);
    }

    $container.append($content);
    $wrapper.append($container);
    $modal.append($wrapper);

    $modals.append($modal);
  });
};

// render data from data.json and add listeners
const parseJSON = (data) => {
  const { skillData, languageData, experienceData, projectData } = data;

  renderSkillData(skillData);
  renderLanguageData(languageData);

  renderExperienceData(experienceData);
  addAccordionListeners();

  renderProjectData(projectData);
  addCardListeners();
  addModalListeners();

  addExpandButtonListeners();
};

// render custom website content
$(document).ready(function () {
  renderBrowserInfo();
  $.getJSON("js/data.json", (data) => {
    parseJSON(data);
  });
});

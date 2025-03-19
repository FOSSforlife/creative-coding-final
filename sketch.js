let currentView = 'library';
let libraryPage;
let albumPage;
let bg;
let font;

function preload() {
  font = loadFont('/assets/Tektur-Regular.ttf');
}

function setup() {
  createCanvas(853, 480);

  // fill('deeppink');
  textFont(font);
  // textSize(36);
  text("Elias's Music Collection", 10, 50);

  libraryPage = new LibraryPage();
  bg = new Background();
}

function draw() {
  bg.update();
  bg.draw();

  switch (currentView) {
    case 'library':
      libraryPage.update();
      libraryPage.draw();
      break;
    case 'album':
      if (!albumPage) {
        break;
      }
      albumPage.update();
      albumPage.draw();
      break;
  }
}

function mouseClicked() {
  switch (currentView) {
    case 'library':
      libraryPage.mouseClicked();
      break;
    case 'album':
      if (!albumPage) {
        break;
      }
      albumPage.mouseClicked();
      break;
  }
}

class Background {
  constructor() {
    this.bubbles = new Array(16).fill(0).map(() => new BackgroundBubble());
    this.transitionState = 'none'; // none, init (up), off-screen (left), onto-screen (right)
    this.transitionProgress = 0.0;
  }
  update() {
    for (const bubble of this.bubbles) {
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 0;
        this.transitionState = 'none';
      } else if (this.transitionState !== 'none') {
        // console.log(this.transitionProgress + ' ' + this.transitionState);
        this.transitionProgress += 1 / 600;
      }
      bubble.update(this.transitionState, this.transitionProgress);
    }
  }
  draw() {
    background(30, 80, 200);
    for (const bubble of this.bubbles) {
      bubble.draw();
    }
  }
}

function transitionVelocity(progress, maxVelocity) {
  return progress < 0.5
    ? map(progress, 0, 0.5, 0, maxVelocity)
    : map(progress, 0.5, 1, maxVelocity, 0);
}

function switchToAlbumPage(album) {
  albumPage = new AlbumPage(album);
  currentView = 'album';
  bg.transitionState = 'off-screen';
  // bg.albumPageColor = album.color;
}

function interpNorm(amount) {
  return -cos(PI * amount) / 2 + 0.5;
}

function interpPoint(x1, x2, amount) {
  return map(interpNorm(amount), 0, 1, x1, x2);
}

class BackgroundBubble {
  constructor() {
    this.mainPosition = createVector(random(width * 2), random(height));
    this.position = this.mainPosition.copy();
    this.zPos = random(-90, 0);
    this.radius = 120 + this.zPos;
    this.mainColor = color(30, 110, random(180, 255));
    this.albumPageColor = color(200, 100, 30);
  }

  update(transitionState, transitionProgress) {
    let maxVelocity;
    let targetX;

    switch (transitionState) {
      case 'none':
        this.position.add(this.velocity);
        break;
      case 'init':
        maxVelocity = 50; // TODO: calculate based on distance and frames
        this.position.add(
          createVector(0, transitionVelocity(transitionProgress, maxVleocity))
        );
        break;
      case 'off-screen':
        targetX =
          this.mainPosition.x -
          (width / 2 - map(1 / this.zPos, 0, 0.5, 0, width / 4));
        this.position.x = interpPoint(
          this.mainPosition.x,
          targetX,
          transitionProgress
        );
        console.log({ targetX, positionX: this.position.x });
        break;
      case 'onto-screen':
        targetX =
          this.mainPosition.x -
          (width / 2 - map(1 / this.zPos, 0, 0.5, 0, width / 4));
        this.position.x = interpPoint(
          this.mainPosition.x,
          targetX,
          transitionProgress
        );
        break;
    }
  }

  draw() {
    noStroke();
    fill(30, 110, this.hue);
    circle(this.position.x, this.position.y, this.radius);
  }
}

class LibraryPage {
  constructor() {
    this.results = albums.map((album) => ({
      ...album,
      Descriptors: album.Descriptors.split(', '),
      imageElement: loadImage(album.Artwork),
    }));
    this.resultsComponent = new ResultsComponent(this.results);
    this.availableTags = ['adventurous', 'futuristic', 'fun', 'harsh'];
    this.selectedTags = [];
    this.queryComponent = new QueryComponent(
      this.availableTags,
      this.selectedTags,
      (filterObj) => this.toggleDescriptor(filterObj)
    );
  }

  toggleDescriptor(descriptorText) {
    if (this.selectedTags.some((name) => name === descriptorText)) {
      this.selectedTags = this.selectedTags.filter(
        (name) => name !== descriptorText
      );
      // print(this.selectedTags);
    } else {
      this.selectedTags.push(descriptorText);
    }
    this.updateResults();
  }

  updateResults() {
    this.results = this.results.filter(
      (album) =>
        album.Descriptors &&
        album.Descriptors.every((descriptor) =>
          this.selectedTags.includes(descriptor)
        )
    );
    this.queryComponent.createComponents(this.selectedTags);
  }

  mouseClicked() {
    this.resultsComponent.mouseClicked();
    this.queryComponent.mouseClicked();
  }

  update() {
    this.resultsComponent.update();
    this.queryComponent.update();
  }
  draw() {
    this.resultsComponent.draw();
    this.queryComponent.draw();
  }
}

class QueryComponent {
  constructor(availableTags, selectedTags, toggleFn) {
    this.tags = availableTags;
    this.selectedTags = selectedTags;
    this.tagComponents = [];
    this.toggleFn = toggleFn;
    this.createComponents(this.selectedTags);
  }

  createComponentsDebug() {
    print({ tags: this.tags });
    print({ selectedTags: this.selectedTags });
  }

  createComponents(selectedTags) {
    // print({tags: this.tags});
    // print({selectedTags: this.selectedTags});
    let x = 50;
    let y = 50;
    this.tagComponents = [];
    for (const descriptorText of this.tags) {
      const bbox = font.textBounds(descriptorText, x, y, 20);
      const selected = selectedTags.some((name) => name === descriptorText);
      this.tagComponents.push({ descriptorText, x, y, bbox, selected });
      x += bbox.w;
      x += 15;
      if (x > width - 150) {
        x = 50;
        y += 30;
      }
    }
  }

  static itemDimensions(index) {
    const margin = {
      x: 50,
      y: 50,
    };
    const itemSize = {
      x: 100,
      y: 20,
    };
    const spacing = 15;
    const rowSize = (width - 2 * margin.x) / (itemSize.x + spacing);

    const itemRow = index % rowSize;
    const itemColumn = Math.floor(index / rowSize);
    const x = margin.x + itemRow * (itemSize.x + spacing);
    const y = margin.y + itemColumn * (itemSize.y + spacing);
    return { itemRow, itemColumn, itemSize, x, y };
  }

  mouseClicked() {
    // print('mouse clicked on query component')
    // print({mouseX, mouseY, tags: this.tagComponents});
    for (const { bbox, descriptorText } of this.tagComponents) {
      if (
        mouseX >= bbox.x &&
        mouseX <= bbox.x + bbox.w &&
        mouseY >= bbox.y &&
        mouseY <= bbox.y + bbox.h
      ) {
        // print(`mouse clicked on ${descriptorText}`);
        this.toggleFn(descriptorText);
      }
    }
  }

  update() {}
  draw() {
    for (const { descriptorText, x, y, bbox, selected } of this.tagComponents) {
      push();
      const boxColor = selected ? color(60, 180, 180) : color(60, 180, 60);
      fill(boxColor);
      noStroke();
      rect(bbox.x, bbox.y, bbox.w, bbox.h);
      stroke(255);
      fill(255);
      text(descriptorText, x, y);
      pop();
    }
  }
}

class ResultsComponent {
  constructor(results) {
    this.results = results;
  }

  mouseClicked() {
    for (let i = 0; i < this.results.length; i++) {
      const { x, y, itemSize } = ResultsComponent.itemDimensions(i);
      if (
        mouseX > x &&
        mouseX < x + itemSize &&
        mouseY > y &&
        mouseY < y + itemSize
      ) {
        switchToAlbumPage(this.results[i]);
      }
    }
  }

  static itemDimensions(index) {
    const margin = {
      x: 50,
      y: 150,
    };
    const itemSize = 100;
    const spacing = 30;
    const rowSize = (width - 2 * margin.x) / (itemSize + spacing);

    const itemRow = index % rowSize;
    const itemColumn = Math.floor(index / rowSize);
    const x = margin.x + itemRow * (itemSize + spacing);
    const y = margin.y + itemColumn * (itemSize + spacing);
    return { itemRow, itemColumn, itemSize, x, y };
  }

  update() {}
  draw() {
    let i = 0;
    for (const album of this.results) {
      push();
      fill(60, 180, 60);
      const { x, y, itemSize } = ResultsComponent.itemDimensions(i);
      image(album.imageElement, x, y, itemSize, itemSize);
      // rect(x, y, itemSize, itemSize, 10, 10, 10, 10);
      pop();
      i++;
    }
  }
}

class AlbumPage {
  constructor(album) {
    this.currentAlbum = album;
  }
  update() {}
  draw() {}
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  add() {
    this.particles.push(new Polygon());
  }

  update() {
    this.particles.forEach((p) => p.move());
  }

  draw() {
    this.particles.forEach((p) => p.draw());
  }
}

class Polygon {
  constructor() {
    this.position = createVector(origin.x, origin.y);
    this.velocity = createVector(random(40) / 10 - 2, random(40) / 10 - 2);
    this.vertices = 3;
    this.radius = 12;
    this.hue = 0;
    this.rotation = 0;
  }

  move() {
    this.position.add(this.velocity);
    this.rotation += 0.1;

    if (this.position.y < 1 || this.position.y > 400) {
      this.hue += 30;
      this.vertices++;
      this.velocity.y *= -1;
    } else if (this.position.x < 1 || this.position.x > 400) {
      this.hue += 30;
      this.vertices++;
      this.velocity.x *= -1;
    }
  }

  draw() {
    fill(color(200, 80, 100));
    push();
    translate(this.position.x, this.position.y);
    rotate(this.rotation);
    beginShape();
    for (let i = 0; i < 360; i += 360 / this.vertices) {
      vertex(cos(i) * this.radius, sin(i) * this.radius);
    }
    endShape();
    pop();
  }
}

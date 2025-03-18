let currentView = 'library';
let libraryPage;
let albumPage;
let bg;
let font;

function preload() {
  // font = loadFont('/assets/inconsolata.otf');
}

function setup() {
  createCanvas(853, 480);

  // fill('deeppink');
  // textFont(font);
  // textSize(36);
  // text('Elias's Music Collection', 10, 50);

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
    this.bubbles = new Array(8).fill(0).map(() => new BackgroundBubble());
    this.transitionState = 'none'; // none, init (up), off-screen (left), onto-screen (right)
    this.transitionProgress = 0.0;
  }
  update() {
    for (const bubble of this.bubbles) {
      bubble.update(this.transitionProgress);
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

function switchToAlbumPage(albumPageColor) {
  bg.transitionState = 'slide-left';
  bg.albumPageColor = albumPageColor;
}

function interpNorm(amount) {
  return -cos(PI * amount) / 2 + 0.5;
}

function interpPoint(x1, x2, amount) {
  return map(interpNorm(amount), 0, 1, x1, x2);
}

class BackgroundBubble {
  constructor() {
    this.mainPosition = createVector(random(width), random(height));
    this.position = this.mainPosition;
    this.zPos = random(-90, 0);
    this.radius = 120 + this.zPos;
    this.transitionState = 'none'; // none, init (up), slide-left, slide-right
    this.transitionProgress = 0.0;
    this.mainColor = color(30, 110, random(180, 255));
    this.albumPageColor = color(200, 100, 30);
  }

  update(transitionProgress) {
    let maxVelocity;

    switch (this.transitionState) {
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
        const targetX =
          this.mainPosition.x -
          (width / 2 - map(1 / zPos, 0, 0.5, 0, width / 4));
        this.mainPosition.x = interpPoint(
          this.mainPosition.x,
          targetX,
          transitionProgress
        );
        break;
      case 'onto-screen':
        maxVelocity = 50; // TODO: calculate based on distance and frames
        this.position.add(
          createVector(-transitionVelocity(transitionProgress, maxVleocity), 0)
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
    this.results = [
      {
        artist: 'Animals as Leaders',
        title: 'The Joy of Motion',
      },
      {
        artist: 'Animals as Leaders',
        title: 'The Joy of Motion',
      },
      {
        artist: 'Animals as Leaders',
        title: 'The Joy of Motion',
      },
      {
        artist: 'Animals as Leaders',
        title: 'The Joy of Motion',
      },
    ];
    this.resultsComponent = new ResultsComponent(this.results);
  }

  query(filters) {
    this.results = this.results.filter(() => true);
  }

  mouseClicked() {
    this.resultsComponent.mouseClicked();
  }

  update() {
    this.resultsComponent.update();
  }
  draw() {
    this.resultsComponent.draw();
  }
}

class QueryComponent {}

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
        albumPage = new AlbumPage(this.results[i]);
        currentView = 'album';
      }
    }
  }

  static itemDimensions(index) {
    const margin = {
      x: 50,
      y: 50,
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
      rect(x, y, itemSize, itemSize, 10, 10, 10, 10);
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
    fill(color(this.hue, 80, 100));
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

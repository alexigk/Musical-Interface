import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MusicLibService, SocketsService, WebglService } from 'src/app/global/services';
import * as matrix from 'gl-matrix';
import { PlayerService } from 'src/app/global/services/player/player.service';
import { PlayerComponent } from '../player/player.component';

/**
 * @todo: Shader hack to simulate a light on top of the camera
 *        Essentially, color the lowest part darker than the highest part.
 *        We can do this using the UV coords.
 */
const VShader = `
attribute vec3 aVertexPosition;
attribute vec2 aUV;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec3 uColor;
varying lowp vec4 vColor;
varying lowp vec2 vUV;
void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    
    vColor = vec4(uColor, 1.0);
    vUV = aUV;
}
`;

const FShader = `
varying lowp vec4 vColor;
varying lowp vec2 vUV;
uniform sampler2D uSampler;

void main(void) {
  // vec4 t = texture2D(uSampler, vec2(vUV.x, -vUV.y));
  gl_FragColor = texture2D(uSampler, vec2(vUV.x, -vUV.y)) * vColor;
}
`;

class CardTexture {
  handle : WebGLTexture;
  path : string;
  album_index: number;
};

/**
 * Handles swipe gestures, because I have no idea why angular can't tell us
 * this invaluable info.
 */
class SwipePropagator {
  private xDown: number;
  private yDown: number;
  private xDiff: number;
  private yDiff: number;
  private onLeftCb;
  private onRightCb;
  private onUpCb;
  private onDownCb;
  
  private xDown2: number;
  private yDown2: number;

  private onScrollVerticalCb;

  private element;
  constructor(element) {
    this.xDown = null;
    this.xDown2 = null;
    this.yDown = null;
    this.yDown2 = null;
    this.element = typeof(element) === 'string' ? document.querySelector(element) : element;

    this.onLeftCb = null;
    this.onRightCb = null;
    this.onUpCb = null;
    this.onDownCb = null;

    this.element.addEventListener('touchstart', function(evt) {
      // console.log('touch started');
      this.xDown = evt.touches[0].clientX;
      this.yDown = evt.touches[0].clientY;

      if (evt.touches.length > 1) {
        this.xDown2 = evt.touches[1].clientX;
        this.yDown2 = evt.touches[1].clientY;
      }
    }.bind(this), false);

  }

  onLeft(callback) {
      this.onLeftCb = callback;

      return this;
  }

  onRight(callback) {
      this.onRightCb = callback;

      return this;
  }

  onUp(callback) {
      this.onUpCb = callback;

      return this;
  }

  onDown(callback) {
      this.onDownCb = callback;

      return this;
  }

  onScrollVertical(callback) {
    this.onScrollVerticalCb = callback;
    return this;
  }

  handleTouchMove2Fingers(evt) {
    var diffX = [
      this.xDown  - evt.touches[0].clientX,
      this.xDown2 - evt.touches[1].clientX,
    ];

    var diffY = [
      this.yDown  - evt.touches[0].clientY,
      this.yDown2 - evt.touches[1].clientY,
    ];

    if ((diffY[0] != 0) && (diffY[1] != 0)) {
      this.onScrollVerticalCb(diffY[0]);
    }
  }

  handleTouchMove(evt) {
    if ( ! this.xDown || ! this.yDown ) {
        return;
    }

    if (evt.touches.length > 1) {
      this.handleTouchMove2Fingers(evt);
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    this.xDiff = this.xDown - xUp;
    this.yDiff = this.yDown - yUp;

    if ( Math.abs( this.xDiff ) > Math.abs( this.yDiff ) ) { // Most significant.
      if ( this.xDiff > 0 ) {
        if (this.onLeftCb != null) this.onLeftCb();
      } else {
        if (this.onRightCb != null) this.onRightCb();
      }
    } else {
      if ( this.yDiff > 0 ) {
        if (this.onUpCb != null) this.onUpCb();
      } else {
        if (this.onDownCb != null) this.onDownCb();
      }
    }

    // Reset values.
    this.xDown = null;
    this.yDown = null;
  }

  run() {
      this.element.addEventListener('touchmove', function(evt) {
          this.handleTouchMove(evt);
      }.bind(this), false);
  }
}

const OFFSET_FRONT = -5.5;
const OFFSET_BACK  = -5.0;

/** 
 *  [Initial] <==> [Target] <==> [Shown] 
 */
enum CardTargetState {
  Initial,
  Target,
};

class Card {
  public texture : CardTexture = null;
  // Currently displayed transform
  public pos: matrix.vec3;
  public rot: matrix.quat;
  public scl: matrix.vec3;

  // Cached transforms for the two various target states
  public posFront : matrix.vec3;
  public posBack  : matrix.vec3;
  public rotFront : matrix.quat;
  public rotBack  : matrix.quat;

  public posShow  : matrix.vec3;
  public rotShow  : matrix.quat;

  // Animation handling

  /** True when the card has been skipped */
  public isBack: boolean;
  public isShown: boolean;
  /** True when animating. Not really an optimization, but it's good for debugging */
  public isAnimating: boolean;
  /** A timer */
  public animationTimer: number;

  public isShowBack: boolean;

  constructor(index: number) {
    this.posFront = matrix.vec3.fromValues(0, 0, -index * 0.25 + OFFSET_FRONT);
    this.rotFront = matrix.quat.create();
    this.rotFront = matrix.quat.fromEuler(this.rotFront, 0, 0, 0);

    this.posBack  = matrix.vec3.fromValues(0, 0, -index * 0.25 + OFFSET_BACK);
    this.rotBack  = matrix.quat.create();
    this.rotBack  = matrix.quat.fromEuler(this.rotBack, 45.0, 0, 0);

    this.pos = matrix.vec3.create();
    matrix.vec3.copy(this.pos, this.posFront);
    this.rot = matrix.quat.create();
    matrix.quat.copy(this.rot, this.rotFront);
    this.scl = matrix.vec3.fromValues(1, 1, 1);

    this.posShow = matrix.vec3.create();
    this.rotShow = matrix.quat.create();

    this.isBack = this.isShown = this.isShowBack = false;
    this.isAnimating = false;
    this.animationTimer = 0.0;  
  }

  targetState: CardTargetState;

  private getPos(forState: CardTargetState) : matrix.vec3 {
    if (!this.isShown) {
      return (this.isBack)
        ? (forState == CardTargetState.Target) ? this.posBack  : this.posFront
        : (forState == CardTargetState.Target) ? this.posFront : this.posBack
        ;
    } else {
      return  (this.isShowBack)
        ? (forState == CardTargetState.Target) ? this.posFront : this.posShow 
        : (forState == CardTargetState.Target) ? this.posShow : this.posFront; 
    }
  }

  private getRot(forState: CardTargetState) : matrix.quat {
    if (!this.isShown) {
      return (this.isBack)
      ? (forState == CardTargetState.Target) ? this.rotBack  : this.rotFront
      : (forState == CardTargetState.Target) ? this.rotFront : this.rotBack
      ;
    } else {
      return  (this.isShowBack)
      ? (forState == CardTargetState.Target) ? this.rotFront : this.rotShow 
      : (forState == CardTargetState.Target) ? this.rotShow : this.rotFront;
    }
  }

  public update(dt: number) {

    if (!this.isAnimating) return;
    
    this.animationTimer += dt;

    const animTime = 0.5;
    const time = this.animationTimer > animTime
      ? animTime
      : this.animationTimer;

    const alpha = time / animTime;

    matrix.vec3.lerp(
      this.pos,
      this.getPos(CardTargetState.Initial),
      this.getPos(CardTargetState.Target),
      alpha
    );

    matrix.quat.slerp(
      this.rot,
      this.getRot(CardTargetState.Initial),
      this.getRot(CardTargetState.Target),
      alpha
    );

    if (this.animationTimer >= animTime) {
      this.isAnimating = false;
      this.animationTimer = 0.0;

      if (this.isShown && this.isShowBack) {
        this.isShown = false;
      }
    }

  }

  public show(eyePos: matrix.vec3, eyeFwd: matrix.vec3) {
    const pitch = -60.0;
    const yaw   = +0.0;
    matrix.quat.fromEuler(this.rotShow, pitch, yaw, 0.0);
    // matrix.quat.invert(this.rotShow, this.rotShow);
    
    this.isAnimating = true;
    this.animationTimer = 0.0;
    this.isShown = true;
    this.isShowBack = false;

    // @todo: convert this to js
    matrix.vec3.scaleAndAdd(this.posShow, eyePos, eyeFwd, 3.0);

    // matrix.vec3.sub(this.posShow, eyePos, eyeFwd);
  }

  public unshow() {
    this.isShown = true;
    this.isShowBack = true;
    this.isAnimating = true;
    this.animationTimer = 0.0;
  }

  public setState(isBack: boolean) {
    // console.log("setting back to " + isBack);
    if (this.isBack == isBack) return;
    // console.log("animating! " + isBack);

    this.isBack = isBack;

    this.isAnimating = true;
    this.animationTimer = 0.0;
  }

  public getMatrix() {
    var result = matrix.mat4.create();
    matrix.mat4.identity(result);

    matrix.mat4.fromRotationTranslationScale(
      result,
      this.rot,
      this.pos,
      this.scl
    );

    return result;
  }
};

@Component({
  selector: 'ami-fullstack-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit, AfterViewInit {

  @ViewChild('sceneCanvas', {read: ElementRef, static: false}) private canvas : ElementRef<HTMLCanvasElement>;

  @Output() playerEmitter = new EventEmitter<string>();
  
  constructor(
    private player: PlayerService,
    private mlib: MusicLibService,
    ) { }

  private get gl() : WebGLRenderingContext {
    return this.renderContext as WebGLRenderingContext;
  }

  /**
   * Render Context
   */
  private renderContext: RenderingContext;

  /** The currently highlighted card */
  private shownCard = 0;
  /** Instance of swipe detection utility */
  private swiper: SwipePropagator;
  /** The cards present */
  private cards: Array<Card>;

  private eyeFwd: matrix.vec3;
  private eyeUp: matrix.vec3;
  private eyePos: matrix.vec3;

  // OpenGL Stuff. If you know graphics, then you should know what these are for

  /** glsl program instance */
  private glProgram: WebGLProgram;
  /** a descriptor object that contains are uniform and attribute locations */
  private glAttribDesc;
  /** vertex buffer for the squares */
  private pBuffer: WebGLBuffer;
  /** our lovely projection matrix */
  private prjMatrix : matrix.mat4;
  private overlayEnabled : boolean = false;
  private overlayTrackViewEnabled : boolean = false;
  
  private musicLibrary: any;

  private forwardCard() {

    if ((this.shownCard >= (this.cards.length - 1))) {
      this.shownCard = this.cards.length - 1;
      return;
    }

    this.cards[this.shownCard].setState(true);
    this.shownCard++;
    console.log('shown :: ' + this.shownCard + ' / ' + this.cards.length);
    // this.cards[this.shownCard].setState(false);
  }

  public getShownCardBasicInfo() : string {
    const nfo = this.getShownCardInfo();
    if (nfo != null) {
      return nfo.author + ' - ' + nfo.album;
    }

    return '';
  }

  public getShownCardInfo() {
    if (this.musicLibrary != null) {
      return this.musicLibrary[this.shownCard];
    } else {
      return null;
    }
  }

  private backCard() {

    if (this.shownCard <= 0) {
      return;
    }

    this.shownCard--;
    this.cards[this.shownCard].setState(false);
    console.log('shown :: ' + this.shownCard + ' / ' + this.cards.length);
    // this.cards[this.shownCard].setState(false);
  }

  public openPlayer() {
    this.playerEmitter.emit(null);
  }

  playButton() {
    const tracks = this.getShownCardInfo().tracks;
    for (var i = 0; i < tracks.length; ++i) {
      this.player.enqueue(this.shownCard, i);
    }
  }

  backOverlay(): void {
    this.overlayEnabled = false;
    this.overlayTrackViewEnabled = false;
    this.cards[this.shownCard].unshow();
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      alert("Canvas not supplied - cannot bind WebGL Context!");
      return;
    }
  
    this.renderContext = this.canvas.nativeElement.getContext('webgl2');
    if (!this.gl) {
      alert('Unable to init WebGL!');
    }
  
    this.gl.canvas.width  = this.canvas.nativeElement.clientWidth;
    this.gl.canvas.height = this.canvas.nativeElement.clientHeight;

    this.mlib.getLib().subscribe((val) => {
      this.musicLibrary = val;
      this.onReady();
    })
  }

  public onClickOverlay() {
    if (!this.overlayEnabled) {
      this.overlayEnabled = true;
      this.cards[this.shownCard].show(this.eyePos, this.eyeFwd);
    } else {
      this.overlayTrackViewEnabled = !this.overlayTrackViewEnabled;
    }
  }

  onReady(): void {

    this.swiper = new SwipePropagator(this.canvas.nativeElement);
    this.swiper.onDown(() => {
      this.forwardCard();
    });
    this.swiper.onUp(() => {
      this.backCard();
    });

    // this.swiper.onScrollVertical((delta) => {
    //   matrix.vec3.add(this.eyePos, this.eyePos, [0, 0, +delta*0.001]);
    // })

    this.swiper.run();

    this.canvas.nativeElement.addEventListener('click', (e)=>{
      this.onClickOverlay();
    });

    this.initShaders();
    this.initBuffers();
    this.bindAttributes();
    this.initCamera();
    this.initTextures();

    const aspect = this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight;
    this.prjMatrix = matrix.mat4.create();
    matrix.mat4.perspective(
      this.prjMatrix,
      (30 * Math.PI) / 180.0,
      aspect,
      0.1,
      100.0);

    // initialize cards
    const numCards = this.musicLibrary.length;
    this.cards = new Array<Card>();
    for (var i = 0; i < numCards; ++i) {
      var card = new Card(i);
      card.texture = this.cardTextures[i];
      this.cards.push(card);
    }

    console.log(numCards);

    setInterval(() => {
      

      this.onRender();

    }, 16);


  }

  private cardTextures : Array<CardTexture>;

  initTextures() {
    
    this.cardTextures = new Array<CardTexture>();

    this.musicLibrary.forEach(element => {
      
      this.cardTextures.push(new CardTexture);

      var cardTexture = this.cardTextures[this.cardTextures.length - 1];
      cardTexture.path = element.cover;
      cardTexture.handle = this.gl.createTexture();

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, cardTexture.handle);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        1,
        1,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255])
      );

      var image = new Image();
      image.src = element.cover;
      image.onload = () => {
        console.log("loaded: " + image.src);
        this.gl.bindTexture(this.gl.TEXTURE_2D, cardTexture.handle);
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.LINEAR
        );

        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MAG_FILTER,
          this.gl.LINEAR
        );

        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          image
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      }
      

    });
    
  }

  initCamera() {
    
    const pitch = -60.0;
    const yaw   = -90.0;

    this.eyeFwd = matrix.vec3.fromValues(
      Math.cos(matrix.glMatrix.toRadian(yaw)) * Math.cos(matrix.glMatrix.toRadian(pitch)),
      Math.sin(matrix.glMatrix.toRadian(pitch)),
      Math.sin(matrix.glMatrix.toRadian(yaw)) * Math.cos(matrix.glMatrix.toRadian(pitch)),
    );

    matrix.vec3.normalize(this.eyeFwd, this.eyeFwd);

    var eyeRight = matrix.vec3.create();
    this.eyeUp = matrix.vec3.create();

    matrix.vec3.cross(
      eyeRight,
      this.eyeFwd,
      matrix.vec3.fromValues(0, 1, 0));

    matrix.vec3.cross(
      this.eyeUp,
      eyeRight,
      this.eyeFwd);


    this.eyePos = matrix.vec3.fromValues(0, 0, 0);
    matrix.vec3.add(
      this.eyePos ,
      this.eyePos ,
      [0, 5, -3]
    );

    matrix.vec3.scaleAndAdd(this.eyePos , this.eyePos , this.eyeFwd, 2.2);
  }
  
  t : number = 0.0;
  onRender(): void {
    
    const dt = 0.016;    
    this.cards.forEach(card => {
        card.update(dt);
    });

    
    this.gl.viewport(0, 0, this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)
    this.t += 0.01;
    var r = (Math.sin(this.t*3) + 1) * .5 * -30 - 50 + 136;
    var g = (Math.sin(this.t*3) + 1) * .5 * -30 - 50 + 41;
    var b = (Math.sin(this.t*3) + 1) * .5 * -30 - 50 + 126;
    this.gl.clearColor(r/255.0, g/255.0, b/255.0, 0.6);
    // this.gl.clearColor(0.0,0.0,0.0,1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pBuffer);
    this.gl.uniformMatrix4fv(this.glAttribDesc.uniforms.prj, false, this.prjMatrix);


    var lookFwd = matrix.vec3.create();
    matrix.vec3.add(lookFwd, this.eyePos, this.eyeFwd);
    
    var viewMatrix = matrix.mat4.create();
    matrix.mat4.lookAt(
      viewMatrix,
      this.eyePos,
      lookFwd,
      this.eyeUp);

    // matrix.mat4.identity(viewMatrix);
    this.gl.uniformMatrix4fv(this.glAttribDesc.uniforms.view, false, viewMatrix);

    for (let i = this.cards.length - 1; i >= 0; --i) {          

      var modelMatrix = this.cards[i].getMatrix();

      this.gl.uniformMatrix4fv(this.glAttribDesc.uniforms.mdl, false, modelMatrix);

      if (this.overlayEnabled ) {
        if (this.cards[i].isShown) {
          this.gl.uniform3f(this.glAttribDesc.uniforms.color, 1.0, 1.0, 1.0);
        } else {
          this.gl.uniform3f(this.glAttribDesc.uniforms.color, 0.5, 0.5, 0.5);
        }
      } else {
        this.gl.uniform3f(this.glAttribDesc.uniforms.color, 1.0, 1.0, 1.0);
      }

      this.gl.bindTexture(this.gl.TEXTURE_2D, this.cards[i].texture.handle);
      this.gl.uniform1i(this.glAttribDesc.uniforms.sampler, 0);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }


  }

  bindAttributes(): void {
    const desc = {
      locations: {
        vPos: this.gl.getAttribLocation(this.glProgram, 'aVertexPosition'),
        uPos: this.gl.getAttribLocation(this.glProgram, "aUV"),
      },

      uniforms: {
        prj:     this.gl.getUniformLocation(this.glProgram, 'uProjectionMatrix'),
        mdl:     this.gl.getUniformLocation(this.glProgram, 'uModelMatrix'),
        view:    this.gl.getUniformLocation(this.glProgram, 'uViewMatrix'),
        color:   this.gl.getUniformLocation(this.glProgram, "uColor"),
        sampler: this.gl.getUniformLocation(this.glProgram, "uSampler"),
      },
    };


    this.glAttribDesc = desc;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pBuffer);

    this.gl.vertexAttribPointer(
      desc.locations.vPos,
      3,
      this.gl.FLOAT,
      false,
      4 * 5,
      0
    );

    this.gl.vertexAttribPointer(
      desc.locations.uPos,
      2,
      this.gl.FLOAT,
      false,
      4 * 5,
      4 * 3,
    );
    this.gl.enableVertexAttribArray(desc.locations.vPos);
    this.gl.enableVertexAttribArray(desc.locations.uPos);


  }

  initShaders(): void {

    var vpart : WebGLShader;
    var fpart : WebGLShader;
    {
      vpart = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vpart, VShader);
      this.gl.compileShader(vpart);

      const status = this.gl.getShaderParameter(vpart, this.gl.COMPILE_STATUS);
      console.log('vshader comp status: ' + status);
    }

    {
      fpart = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fpart, FShader);
      this.gl.compileShader(fpart);

      const status = this.gl.getShaderParameter(fpart, this.gl.COMPILE_STATUS);
      console.log('fshader comp status: ' + status);
      if (status == 0) {
        const nfo = this.gl.getShaderInfoLog(fpart);
        console.log('because: ' + nfo);
      }
    }

    this.glProgram = this.gl.createProgram();
    this.gl.attachShader(this.glProgram, vpart);
    this.gl.attachShader(this.glProgram, fpart);
    this.gl.linkProgram(this.glProgram);

    const status = this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS);
    console.log('prg link stat: ' + status);
    if (!status) {
      const lg = this.gl.getProgramInfoLog(this.glProgram);
      console.log('info: ' + lg);

    }

    this.gl.useProgram(this.glProgram);

  }

  initBuffers(): void {
    this.pBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pBuffer);

    const positions = new Float32Array([
       +0.5,+0.5, 0.0,  1.0, 1.0,
       -0.5,+0.5, 0.0,  0.0, 1.0,
       +0.5,-0.5, 0.0,  1.0, 0.0,
       -0.5,+0.5, 0.0,  0.0, 1.0,
       -0.5,-0.5, 0.0,  0.0, 0.0,
       +0.5,-0.5, 0.0,  1.0, 0.0,
    ]);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  ngOnInit() {
  }

}

import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, SphereGeometry, BufferGeometry, Quaternion, Vector3Like, CylinderGeometry, WireframeGeometry, Line } from "three";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly _camera: PerspectiveCamera;
  private readonly _destroyed: ReplaySubject<boolean>;
  private readonly _renderer: WebGLRenderer;

  title = 'hq78-messingaround-angular';

  @ViewChild("threeJsOutlet")
  threeJsOutlet!: ElementRef;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this._camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
    this._destroyed = new ReplaySubject<boolean>(1);
    this._renderer = new WebGLRenderer();
  }

  ngOnDestroy(): void {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  ngAfterViewInit(): void {
    const self = this;
    const scene = new Scene();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this.threeJsOutlet.nativeElement.appendChild(this._renderer.domElement);

    const sphereRadius = 2;
    const sphere = new SphereGeometry(sphereRadius, 12, 12, 0, Math.PI * 2, 0, Math.PI);
    const material = new MeshBasicMaterial({color: 0x00ff00 });
    const blueMaterial = new MeshBasicMaterial({color: 0x0000ff });
    const mesh = new Mesh(sphere, material);
    scene.add(mesh);

    const pointsOnSphere: Mesh[] = [];
    const pointsToGenerate = 400;

    for (let i = 0; i < pointsToGenerate; i++) {
      const { x, y, z } = this.determineRandomPointOnSphereV2(sphereRadius, 0, 0, 0);
      const sphere = new SphereGeometry(.1, 32, 32);
      sphere.translate(x, y, z);
      const geoMesh = new Mesh(sphere, blueMaterial);
      geoMesh.translateX(x);
      geoMesh.translateY(y);
      geoMesh.translateZ(z);

      const lineGeometry = new BufferGeometry();
      const line = new Line();

      pointsOnSphere.push(geoMesh);
    }

    scene.add(...pointsOnSphere);
    // camera.position.set(20, 0, 0);
    this._camera.position.z = 5;
    this._camera.lookAt(mesh.position);

    // Rotate the scene around the x-axis every 2 seconds.
    (function () {
      let start: DOMHighResTimeStamp;
      const animationDurationMS = 40000;

      function animate(timeStamp: DOMHighResTimeStamp) {
        if (self._destroyed.closed) {
          return;
        }

        if (start === undefined || start === null) {
          start = timeStamp;
        }

        let elapsed = timeStamp - start;

        // If elapsed is greater than the animation duration, normalize it.
        if (elapsed > animationDurationMS) {
          elapsed -= Math.floor(elapsed / animationDurationMS) * animationDurationMS;
        }

        const percentComplete = elapsed / animationDurationMS;
        const newAngleDeg = percentComplete * 360;
        const newAngleRadians = ((newAngleDeg) * Math.PI) / 180;
  
        const quaternion = new Quaternion().setFromAxisAngle({x: 0, y: 1, z: 0}, newAngleRadians);
        scene.rotation.setFromQuaternion(quaternion, 'XYZ', true);

        requestAnimationFrame(animate);
        self._renderer.render(scene, self._camera);
      }
  
      requestAnimationFrame(animate);
    })();
  }

  @HostListener("window:resize", ["$event"])
  public onWindowResize(event: Event): void {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize( window.innerWidth, window.innerHeight );
  }

  private randomSignedNumber(): -1|1 {
    return Math.random() > .5 ? 1 : -1;
  }

  private determineRandomPointOnSphereV2(
    radius: number,
    sphereX: number,
    sphereY: number,
    sphereZ: number
  ): Vector3Like {
    // Formula:
    // Step 1:
    // x = Math.random();
    // y = Math.random();
    // z = Math.random();
    //
    // Step 2:
    // x *=
    //          1
    // ---------------------
    // sqrt(x^2 + y^2 + z^2)
    // y *=
    //          1
    // ---------------------
    // sqrt(x^2 + y^2 + z^2)
    // z *=
    //          1
    // ---------------------
    // sqrt(x^2 + y^2 + z^2)
    // Step 3:
    // x *= radius;
    // y *= radius;
    // z *= radius;

    let x = Math.random() * this.randomSignedNumber();
    let y = Math.random() * this.randomSignedNumber();
    let z = Math.random() * this.randomSignedNumber();

    const multiplyByThis = 1 / (Math.sqrt(Math.pow(x, 2)) + Math.sqrt(Math.pow(y, 2)) + Math.sqrt(Math.pow(z, 2)));
    x *= multiplyByThis;
    y *= multiplyByThis;
    z *= multiplyByThis;

    x *= radius;
    y *= radius;
    z *= radius;

    const result = {x, y, z};

    // console.log(result);
    
    return result;
  }

  private determineRandomPointOnSphereV1(
    radius: number,
    sphereX: number,
    sphereY: number,
    sphereZ: number
  ): Vector3Like {
    const theta = Math.random() * Math.PI / -2;
    const phi = Math.random() * Math.PI / -2;

    const pointX = radius * Math.sin(theta) * Math.cos(phi);
    const pointY = radius * Math.sin(theta) * Math.sin(theta);
    const pointZ = radius * Math.cos(theta);

    const result = {
      x: pointX + sphereX,
      y: pointY + sphereY,
      z: pointZ + sphereZ,
    };

    console.log("randomPoint", result);

    return result;
  }
}

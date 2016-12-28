/**
 * Dronesmith Cloud
 *
 * Principle Engineer: Geoff Gardner <geoff@dronesmith.io>
 *
 * Copyright (C) 2016 Dronesmith Technologies Inc, all rights reserved.
 * Unauthorized copying of any source code or assets within this project, via
 * any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */

'use strict';

angular
  .module('ForgeApp')
	.directive('renderer', function () {
			return {
				restrict: "E",
				scope: {
					bind: "=bind",
          fullscreen: "=fullscreen",
          basealt: "=basealt"
				},
				link: function (scope, elem, attr) {
					var camera;
          var controls;
					var scene;
					var renderer;
					var previous;
          var headingVect;
          var climbVect;
          var envMap;

					// init scene
					init();

					var loader1 = new THREE.STLLoader();
          var mesh;

          var isSim = false;

					// scope.$watch("bind", function(newValue, oldValue) {
					// 	if (newValue != oldValue) {
          //     scope.bind = newValue;
          //   }
					// });

          // console.log(elem, $(elem)[0]);

          function initEnvMap() {
            var urls = [
              "assets/img/renderer/desertsky_left.jpg",
              "assets/img/renderer/desertsky_right.jpg",
              "assets/img/renderer/desertsky_top.jpg",
              "assets/img/renderer/desertsky_top.jpg",
              "assets/img/renderer/desertsky_back.jpg",
              "assets/img/renderer/desertsky_front.jpg"
            ];

            var loader = new THREE.CubeTextureLoader();

            var cubemap = loader.load(urls);
            cubemap.format = THREE.RGBFormat;
            return cubemap;
          }

          function initSkyBox() {
            var urls = [
              "assets/img/renderer/desertsky_left.jpg",
              "assets/img/renderer/desertsky_right.jpg",
              "assets/img/renderer/desertsky_top.jpg",
              "assets/img/renderer/desertsky_top.jpg",
              "assets/img/renderer/desertsky_back.jpg",
              "assets/img/renderer/desertsky_front.jpg"
            ];

            var loader = new THREE.TextureLoader();

            var materialArray = [];
          	for (var i = 0; i < 6; i++) {
              var txt = loader.load(urls[i]);
          		materialArray.push(new THREE.MeshBasicMaterial({
          			map: txt,
          			side: THREE.BackSide
          		}));
            }

              var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
          	// var skyMaterial =  new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

            var size = 2000;
            var skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(size, size, size), skyMaterial);
            return skyboxMesh;
          }

					function loadModel(modelUrl) {

             loader1.load(modelUrl, function(geometry) {
               var material;
               if (geometry.hasColors) {
                 material = new THREE.MeshLambertMaterial({
                   color:0x3366dd,
                   opacity: geometry.alpha,
                   vertexColors: THREE.NoColors,
                   reflectivity: .25,
                   envMap: envMap});
                //  material = new THREE.MeshPhongMaterial({color: 0xff00ff, opacity: geometry.alpha, vertexColors: THREE.NoColors });
                 mesh = new THREE.Mesh( geometry, material );
               } else {
                 material = new THREE.MeshLambertMaterial({
                   color:0x3366dd,
                   opacity: geometry.alpha,
                   vertexColors: THREE.NoColors,
                   reflectivity: .25,
                   envMap: envMap});
                //  material = new THREE.MeshPhongMaterial({color: 0xff00ff, opacity: 1.0, vertexColors: THREE.NoColors });
                 mesh = new THREE.Mesh( geometry, material);
               }
               mesh.scale.set(.25,.25,.25);
               scene.add(mesh);
             });
					}

					loadModel("assets/models/quark_simple.stl");
					animate();

					function init(aa) {
            var width = 320, height = 240;

            if (scope.fullscreen) {
              width = window.innerWidth;
              height = window.innerHeight;
            }

            if (!scope.basealt) {
              scope.basealt = 0;
            }

            envMap = initEnvMap();

            // Init camera
						camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
						camera.position.set(2, 4, 5);

            // Add controls for camera
            controls = new THREE.TrackballControls(camera, $(elem)[0]);
	          controls.rotateSpeed = 3.0;
	          controls.zoomSpeed = 0.4;
	          controls.panSpeed = 0.8;

	          controls.noZoom = false;
	          controls.noPan = false;

	          controls.staticMoving = true;
	          controls.dynamicDampingFactor = 0.3;

            // Init scene
						scene = new THREE.Scene();
						scene.fog = new THREE.FogExp2(0xadd5f7, 0.0006);

						// Lights
						scene.add(new THREE.AmbientLight(0x404040));
						var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(100, 100, 50);
						scene.add(directionalLight);

            // axis
            scene.add(renderAxes(5));

            // ground
            scene.add(renderPlane());

            headingVect = renderLine();
            scene.add(headingVect);

            climbVect = renderClimb();
            scene.add(climbVect);

            scene.add(initSkyBox());

						// Renderer
						renderer = new THREE.WebGLRenderer({antialias: aa || false});
						renderer.setSize(width, height);
            renderer.setClearColor(0xadd5f7);
						elem[0].appendChild(renderer.domElement);

						// Events
            // FIXME
						window.addEventListener('resize', onWindowResize, false);

            scope.$watch(function() { return $(elem).is(':visible') }, function() {
              controls.handleResize();
            });
					}

          // Render axis
          function renderAxes(length) {
		        var axes = new THREE.Object3D();

		        axes.add(buildAxis(
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(length, 0, 0),
              0xFF0000, false)); // +X
		        axes.add(
              buildAxis(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(-length, 0, 0),
                0xFF0000, true)); // -X
		        axes.add(
              buildAxis(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, length, 0),
                0x00FF00, false)); // +Y
		        axes.add(
              buildAxis(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, -length, 0),
                0x00FF00, true)); // -Y
		        axes.add(
              buildAxis(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, length),
                0x0000FF, false)); // +Z
		        axes.add(
              buildAxis(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -length),
                0x0000FF, true)); // -Z

		        return axes;
	        }

          // Set up axis objects
          function buildAxis(src, dst, colorHex, dashed) {
            var
              geom = new THREE.Geometry(),
              mat;

            if (dashed) {
              mat = new THREE.LineDashedMaterial({ linewidth: 2, color: colorHex, dashSize: 1, gapSize: 1 });
            } else {
              mat = new THREE.LineBasicMaterial({ linewidth: 2, color: colorHex });
            }

            geom.vertices.push( src.clone() );
            geom.vertices.push( dst.clone() );
            geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

            var axis = new THREE.Line(geom, mat, THREE.LineSegments);

            return axis;
          }

					//
					function onWindowResize(event) {
            if (scope.fullscreen) {
              renderer.setSize(window.innerWidth, window.innerHeight);
  						camera.aspect = window.innerWidth / window.innerHeight;
  						camera.updateProjectionMatrix();
            }
					}

					//
					var t = 0;

					function animate() {
            controls.update();
						requestAnimationFrame(animate);
						render();
					}

          function renderLine() {
            var material = new THREE.LineBasicMaterial({
	             color: 0xffff00,
               linewidth: 3
             });

             var geometry = new THREE.Geometry();
             geometry.vertices.push(
	            new THREE.Vector3( 5, .5, 0 ),
	            new THREE.Vector3( 0, .5, 0 )
            );

            var line = new THREE.Line(geometry, material);
            return line;
          }

          function renderClimb() {
            var material = new THREE.LineBasicMaterial({
               color: 0x0000ff,
               linewidth: 3
             });

             var geometry = new THREE.Geometry();
             geometry.vertices.push(
              new THREE.Vector3( 0, 2, 0 ),
              new THREE.Vector3( 0, 0, 0 )
            );

            var line = new THREE.Line(geometry, material);
            return line;
          }

          function renderPlane() {
            var plane = new THREE.Object3D();
            var geometry = new THREE.PlaneGeometry( 1000, 1000, 1 );
            // var material = new THREE.MeshBasicMaterial( {color: 0x265902, side: THREE.DoubleSide} );
            var loader = new THREE.TextureLoader();
            var texture = loader.load('assets/img/renderer/grid3.png');
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(512, 512);
            var material = new THREE.MeshLambertMaterial({
              map: texture,
              emissive: 0x265902,
              side: THREE.DoubleSide,
              reflectivity: .1,
              envMap: envMap});
            plane.add(new THREE.Mesh( geometry, material ));
            plane.rotation.x = 3.14159 / 2;
            return plane;
          }

          function renderArrow() {
            var sourcePos = new THREE.Vector3(0, 0, 0);
            var targetPos = new THREE.Vector3(0, 5, 0);
            var direction = new THREE.Vector3().sub(targetPos, sourcePos);
            var arrow = new THREE.ArrowHelper(direction.clone().normalize(), sourcePos, direction.length(), 0xffff00);
            return arrow;
          }

					//
					function render() {
            if (scope.bind && mesh) {
              if (scope.bind['ATTITUDE']) {
                mesh.rotation.y = scope.bind['ATTITUDE'].yaw;
				        mesh.rotation.x = scope.bind['ATTITUDE'].pitch;
                mesh.rotation.z = scope.bind['ATTITUDE'].roll;
              }

              var gpsAlt;
              if (scope.bind['GLOBAL_POSITION_INT']) {
                // console.log('PX4 & 3DR Got here');
                gpsAlt = scope.bind['GLOBAL_POSITION_INT'].alt / 100 || 0;
              } else if (scope.bind['GPS_GLOBAL_ORIGIN']) {
                gpsAlt = scope.bind['GPS_GLOBAL_ORIGIN'].altitude / 100 || 0;
              } else {
                gpsAlt = 0;
              }

              var finalAlt = 0;
              if (scope.bind['GPS_RAW_INT'] && gpsAlt != 0) {
                // console.log('PX4 & 3DR Got here');
                finalAlt = Math.abs((scope.bind['GPS_RAW_INT'].alt / 100) - gpsAlt);

              } else if (scope.bind['VFR_HUD']) {
                // console.log('PX42 Got here');
                finalAlt = Math.abs((scope.bind['VFR_HUD'].alt / 100) - gpsAlt);
              }

              if (scope.bind && scope.bind['HEARTBEAT']) {
                // console.log(scope.bind['HEARTBEAT']);
                if (scope.bind['HEARTBEAT'].custom_mode == 7) {
                  // console.log('simly');
                  isSim = true;
                } else {
                  isSim = false;
                }
              }

              // altitude
              if (DSSProps.useRealAlt) {
                mesh.position.y = finalAlt;
              } else {
                mesh.position.y = finalAlt / 100;
              }

              if (isSim) {
                mesh.position.y += 5;
              }

              // location
              if (scope.bind['VFR_HUD'] && scope.bind['VFR_HUD'].groundspeed >= 0.1) {
                mesh.position.z += -(scope.bind['VFR_HUD'].groundspeed*Math.cos(scope.bind['VFR_HUD'].heading * (3.14159 / 180))) / 20;
                mesh.position.x += -(scope.bind['VFR_HUD'].groundspeed*Math.sin(scope.bind['VFR_HUD'].heading * (3.14159 / 180))) / 20;
              }

              if (scope.bind['VFR_HUD']) {
                headingVect.scale.z = 1 -  (scope.bind['VFR_HUD'].groundspeed*Math.cos(scope.bind['VFR_HUD'].heading * (3.14159 / 180))) / 1;
                headingVect.scale.x = 1 - (scope.bind['VFR_HUD'].groundspeed*Math.sin(scope.bind['VFR_HUD'].heading * (3.14159 / 180))) / 1;
                headingVect.rotation.y = ((90 + scope.bind['VFR_HUD'].heading) * (3.14159 / 180));
              }
              headingVect.position.y = mesh.position.y;
              headingVect.position.x = mesh.position.x;
              headingVect.position.z = mesh.position.z;

              climbVect.position.y = mesh.position.y;
              climbVect.position.x = mesh.position.x;
              climbVect.position.z = mesh.position.z;
              if (scope.bind['VFR_HUD']) {
                climbVect.scale.y = 1 + scope.bind['VFR_HUD'].climb;
              }
            }
						// var timer = Date.now() * 0.0005;
						// camera.position.x = Math.cos(timer) * 10;
						// camera.position.y = 4;
						// camera.position.z = Math.sin(timer) * 10;
            if (mesh && scope.bind) {
              // camera.position.y = 4 + mesh.position.y;

              // Update camera kinematics
              switch (scope.bind.camera) {
                case 'follow':
                  var relativeCameraOffset = new THREE.Vector3(0,20,100);
                  var cameraOffset = relativeCameraOffset.applyMatrix4(mesh.matrixWorld);

                  camera.position.x = cameraOffset.x;
                  camera.position.y = cameraOffset.y;
                  camera.position.z = cameraOffset.z;
                  camera.lookAt(mesh.position);
                  mesh.visible = true;
                  headingVect.visible = true;
                  break;

                case 'pilot':
                  camera.position.set(0, 5, 20);
                  camera.lookAt(mesh.position);
                  mesh.visible = true;
                  headingVect.visible = true;
                  break;
                case 'fps':
                  camera.position.x = mesh.position.x;
                  camera.position.y = mesh.position.y;
                  camera.position.z = mesh.position.z;
                  camera.rotation.x = mesh.rotation.x;
                  camera.rotation.y = mesh.rotation.y;
                  camera.rotation.z = mesh.rotation.z;
                  mesh.visible = false;
                  headingVect.visible = false;
                  break;
              }
            } else {
            	camera.lookAt(scene.position);
            }

            // Render world
						renderer.render(scene, camera);
					}
				}
			}
		}
	)
;

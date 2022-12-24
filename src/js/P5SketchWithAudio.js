import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import SaveJSONToFile from './functions/SaveJSONToFile.js';

import audio from "../audio/diamonds-no-2.ogg";
import midi from "../audio/diamonds-no-2.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[2].notes; // Synth 1 - Sub Bass 2
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.xSize = 0;

        p.ySize = 0;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            // p.generateCells();
            p.cells = require('../json/grid-64x64.json');
            p.xSize = p.height / p.random([64, 48]);
            p.ySize = p.width / p.random([64, 48]);
            p.noFill();
            p.stroke(p.random(255), p.random(255), p.random(255));
            p.strokeWeight(4);
            p.noLoop();
        }

        p.draw = () => {
            
            
            p.cells.forEach(cell => {
                const { x, y, loopIndex } = cell;
                p.ellipse(p.xSize * x, p.xSize * y, p.xSize / 8, p.xSize / 8);
            });

            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.cells = [];

        p.generateCells = () => {
            let loopIndex = 1;
            for (let i = 0; i <= 64; i++) {
                for (let x = -i; x < i; x++) {
                    for (let y = -i; y < i; y++) {

                        const key = x + '-' + y;
                        if (! p.cells.some(r => r.key === key)) {
                            p.cells.push(
                                {
                                    key: key,
                                    x: x,
                                    y: y,
                                    loopIndex: loopIndex
                                }
                            );
                        }
                        
                    }
                }
                loopIndex++;
            }
            SaveJSONToFile(p.cells, 'grid.json');
        }

        p.startingPositions = [
            {
                x: 1,
                y: 1
            },
            {
                x: 1,
                y: 3
            },
            {
                x: 3,
                y: 1
            },
            {
                x: 3,
                y: 3
            },
        ]


        p.executeCueSet1 = (note) => {
            const { currentCue, duration } = note;
            if(currentCue % 4 === 1){
                p.background(0);
                p.startingPositions = p.shuffle(p.startingPositions);
                p.diamonds = [];
            }

            

            p.xSize = p.height / p.random([128, 64, 32]);
            p.ySize = p.width / p.random([128, 64, 32]);

            p.lines = [];

            for (let i = 0; i < 32; i++) {
                
                if(i > 0) {
                    const numberOfLines = i * 2 + 1;
                    // connecting cell and top left

                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = j === numberOfLines ? p.xSize * (j - 2) * -1 : p.xSize * j * -1,
                            y1 = p.ySize * (j - numberOfLines),
                            x2 = p.xSize  * (j - 1)* -1, 
                            y2 = p.ySize * (j - 1 - numberOfLines);
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                        });
                    }
                    
                    //top right
                    
                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = p.xSize * (j - 1),
                            y1 = p.ySize * (j - 1 - numberOfLines),
                            x2 = p.xSize * j, 
                            y2 = p.ySize * (j - numberOfLines);
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                        });
                    }

                    // bottom right
                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = p.xSize * j,
                            y1 = p.ySize * (j - numberOfLines) * -1,
                            x2 = p.xSize  * (j - 1), 
                            y2 = p.ySize * (j - 1 - numberOfLines) * -1;
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                        });
                    }

                    // bottom left
                    for (let j = 1; j <= numberOfLines; j++) {
                            const x1 = p.xSize * (j - 1) * -1,
                            y1 = p.ySize * (j - 1 - numberOfLines) * -1,
                            x2 = p.xSize * j * -1, 
                            y2 = p.ySize * (j - numberOfLines) * -1;
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                        });
                    }
                }
                else {
                    // top right
                    p.lines.push({
                        x1: p.xSize * 0,
                        y1: p.ySize * -1,
                        x2: p.xSize * 1,
                        y2: p.ySize * 0,
                    })
                    // bottom right
                    p.lines.push({
                        x1: p.xSize * 1,
                        y1: p.ySize * 0,
                        x2: p.xSize * 0,
                        y2: p.ySize * 1
                    });
                    // bottom left
                    p.lines.push({
                        x1: p.xSize * 0,
                        y1: p.ySize * 1,
                        x2: p.xSize * -1,
                        y2: p.ySize * 0,
                    });
                }
            }

            const diamondIndex = currentCue % 4 ? currentCue % 4 - 1 : 3; 
            p.diamonds[diamondIndex] = p.lines;

            p.diamonds.forEach((diamond, index) => {
                const lines = diamond, 
                    startingPos = p.startingPositions[index],
                    { x, y } = startingPos,
                    startX = p.width / 4 * x,
                    startY = p.height / 4 * y;

                const delay = (duration * 1000 / lines.length) * 0.75;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i],
                        { x1, y1, x2, y2 } = line;

                    setTimeout(
                        function () {
                            p.translate(startX, startY);
                            p.line(x1,y1,x2,y2);
                            p.translate(-startX, -startY);
                        },
                        (delay * i)
                    );
                    
                }
            });
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;

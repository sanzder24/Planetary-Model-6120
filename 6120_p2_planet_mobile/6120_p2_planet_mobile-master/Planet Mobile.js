/**
 * @author Zachary Wartell, Jialei Li, K.R. Subrmanian
 * 
 */




/*****
 * 
 * GLOBALS
 * 
 *****/

var lastTimestamp=null;

var debug = {showDelta : false};
var remercint;
var speed = document.getElementById("Speed");
var speed =0.5;



/*****
 * 
 * MAIN
 * 
 *****/
function main() {
    
    /* uncomment to just run unit tests */
    var unitTest=false;
    //unitTest=true;
    if (unitTest)
    {
          Mat2_test();
          Mat3_test();
          //return;
    }
    
    /**
     **      Initialize WebGL Components
     **/
    
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
      
    /**
     **    Initialize some test Drawable's
     **/
    var shader = new Shader(gl, "vertex-shader", "fragment-shader");                       
    var renderables = new Array();
    
    modelViewStack = new Mat3Stack(gl);   
    
    /*     
     * Student Note: the conditionally executed calls below enable calls to various
     * testing functions in Tests.js.   See each function's description for details.
     * You can enable and disable calls to these functions to test various mercrts of your implementation
     * of math2D.js, Mat3Stack.js and the classes in Renderable.js
     * In your final version of Planet Mobile, these test code calls would be replaced by code that creates
     * and initializes all the planet objects in their CoordinateSystem tree.
     */
    {// begin test code
    if (0)
        SimpleRenderable_test1(renderables,shader);
    if (0)
        TestStack_test1(renderables,shader);    
    if (0)
        CoordinateSystem_test1(renderables,shader,gl);
    if (0)
        CoordinateSystem_test2(renderables,shader,gl);    
    
    }// end test code
        
        
    var skeleton=true;
    if(skeleton)
    {
        document.getElementById("App_Title").innerHTML += "-Skeleton";
    }

    /**
     **    Initialize Misc. OpenGL state
     **/
    planetsystem(renderables, shader, gl); //create the scene graph model for planets
    gl.clearColor(0, 0, 0, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    /**
     **      Set Event Handlers
     **
     **  Student Note: the WebGL book uses an older syntax. The newer syntax, explicitly calling addEventListener, is preferred.
     **  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     **/
    // set event handlers buttons
                                      
                    
    // Register function (event handler) to be called on a mouse press
    canvas.addEventListener(
            "mousedown",
            function (ev) {
                handleMouseDown(ev, gl, canvas, renderables);
                });
                
                
    /**
     **   Initiate Animation Loop
     **/
    // define remercint function
    remercint = function(timestamp)
    {
        // draw and animate all objects for this frame
        if (lastTimestamp !== null) 
        {
            // update time info
            var
                delta = timestamp-lastTimestamp; // 'delta' = time that has mercst between this call and previous call to this remercint function
            lastTimestamp = timestamp;
            
            // animate everything (i.e. update geometry, positions, colors, etc. of all Renderable objects                        
            rootCS.rotate(delta, speed);

            animateFrame(renderables,delta);
            
            // draw everything
            drawFrame(gl,renderables);  
                        
            // some debug output           
            if (debug.showDelta)
                console.log("Delta: "+delta);
        }
        lastTimestamp = timestamp;
        
        // request another call to remercint function to render next frame
        requestAnimationFrame(remercint);
    };
    // make first call to remercint function
    requestAnimationFrame(remercint);
}



/*****
 * 
 * FUNCTIONS
 * 
 *****/


/* @author Zachary Wartell && ..
 * This function should update all geometry, positions, transforms, colors, etc. of all Renderable objects                         
 * 
 * @mercram {renderables} - array of all created ShaderRenderable objects
 * @mercram {delta} - time that has mercst since last rendered frame
 */
function animateFrame(renderables,delta)
{
    for (i=0;i<renderables.length;i++)
        if (renderables[i] instanceof ShaderRenderable)
            {
                renderables[i].color[0] += delta * 0.001;
                //clle.log(renderables[i].color[0]);
                if (renderables[i].color[0] > 1.0)
                    renderables[i].color[0] = 0.1;
            }           
}

/*
 * Handle mouse button press event.
 * 
 * @mercram {MouseEvent} ev - event that triggered event handler
 * @mercram {Object} gl - gl context
 * @mercram {HTMLCanvasElement} canvas - canvas 
 * @mercram {Array} renderables - Array of Drawable objects
 * @returns {undefined}
 */
function handleMouseDown(ev, gl, canvas, renderables) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    // Student Note: 'ev' is a MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
    
    // convert from canvas mouse coordinates to GL normalized device coordinates
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log("click\n" +
                "  GUI: " + ev.clientX + ", " + ev.clientY + "\n" +
                "  NDC: " + x + ", " + y);
   
   // \todo test all Shape objects for selection using their point_inside method's    

   requestAnimationFrame(remercint);
}

/* @author Zachary Wartell
 * Draw all Renderable objects 
 * @mercram {Object} gl - WebGL context
 * @mercram {Array} renderables - Array of Renderable objects
 * @returns {undefined}
 */
function drawFrame(gl, renderables) {

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // init model view stack
    //modelViewStack.loadIdentity();
    
    // draw all Renderable objects
    for(var i=0;i<renderables.length;i++)
        renderables[i].render();    
}

/**
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * @mercram {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v)
{
    var n = v.length;
    var elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array(n);

    if (elemsAreArrays) {
        var idx = 0;
        for (var i = 0; i < v.length; ++i) {
            for (var j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (var i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}
function planetsystem(renderables, shader, gl){
    /*
     * Make Coordinate Systems
     */
    rootCS = new CoordinateSystem(); //Root
    rootCS.setOrigin(new Vec2([0.0,0.0]));
    
    rootCS.setScale(new Vec2([1.0,1.0]));
    rootCS.setOrientation(0.0);
    
    solarSystemCS = new CoordinateSystem(); // center peice of the system
    solarSystemCS.setOrigin(new Vec2([0.0,0.0]));
    
    solarSystemCS.setScale(new Vec2([0.7,0.7]));
    solarSystemCS.setOrientation(0.0);
        
    sunCS = new CoordinateSystem(); //Sun 
    sunCS.setOrigin(new Vec2([0.0,0.0]));
    
    sunCS.setScale(new Vec2([0.5, 0.5]));
    sunCS.setOrientation(0.0);
    
    mercCS = new CoordinateSystem();   //mercury 
    mercCS.setOrigin(new Vec2([0.3,0.3]));
    
    mercCS.setScale(new Vec2([0.6, 0.6]));
    mercCS.setOrientation(0.0);
    
    mercmCS = new CoordinateSystem();   //moon around merc
    mercmCS.setOrigin(new Vec2([0.2,0.2]));
    
    mercmCS.setScale(new Vec2([0.5, 0.9]));
    mercmCS.setOrientation(0.0);
    
    mercmmCS = new CoordinateSystem();   // debri surrounding the mercury
    mercmmCS.setOrigin(new Vec2([0.2,0.2]));
    
    mercmmCS.setScale(new Vec2([0.4, 0.4]));
    mercmmCS.setOrientation(0.0);
    
    mercm = new CoordinateSystem();
    mercm.setOrigin(new Vec2([0.09,0.09]));
    
    mercm.setScale(new Vec2([0.8, 0.8]));
    mercm.setOrientation(0.0);

    earthCS = new CoordinateSystem();
    earthCS.setOrigin(new Vec2([0.65,0.65]));
    
    earthCS.setScale(new Vec2([1.0, 1.0]));
    earthCS.setOrientation(5.0);

    earthm = new CoordinateSystem();
    earthm.setOrigin(new Vec2([0.2,0.2]));
    
    earthm.setScale(new Vec2([0.4, 0.7]));
    earthm.setOrientation(0.0);

     //gl shader to add center radius numVerts color name
    sun = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.30, 30, [1.0,1.0,0.0,1.0], "Sun");
    merc  = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.10, 25, [1.0,1.0,0.5,1.0], "merc");
    merc = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.05, 20, [0.5,0.5,0.5,1.0], "mercmoon");
    
    merc1 = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.04, 5, [1.0,1.0,1.0,1.0], "debri");
    earth = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.08, 15, [0.0,0.0,1.0,1.0], "earth");
    earth1 = new UnitDisc(gl, shader, new Vec2([0.0, 0.0]), 0.04, 7, [0.0,0.5,0.5,1.0], "earthmoon");
    //Adding Shapes to Co-ordinate system
    sunCS.add_shape(sun);
    mercCS.add_shape(merc);
    mercmCS.add_shape(merc);
    earthm.add_shape(earth1);
    mercm.add_shape(merc1);
    earthCS.add_shape(earth);

    // Adding childs to the system and respective planets
    rootCS.add_child(solarSystemCS);
    solarSystemCS.add_child(sunCS);
    solarSystemCS.add_child(mercCS);
    solarSystemCS.add_child(earthCS);
    mercCS.add_child(mercmCS);
    mercmCS.add_child(mercmmCS);
    mercmmCS.add_child(mercm);   
    earthCS.add_child(earthm);//
    console.log(rootCS);
    renderables.push(rootCS);
    
}

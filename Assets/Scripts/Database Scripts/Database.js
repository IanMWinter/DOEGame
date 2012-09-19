/*
Database.js
By Katharine Uvick

This script will be used to store data of the different specific buildings
involved in the game, as well as the buildings currently placed on the grid.
It also contains the scripts to alter the data (to link buildings, add them to
the grid, etc.)

It uses a series of arrays to store the data in order to keep the information
organized and flexible, rather than a fixed matrix or 2d array that would need
to be detailed on what each column and row represented.

Also contains undo functionality.

AUG 7  Update: added Requisistion System functions, as well as the requisition
points attribute to buildings. NEEDS TO BE EDITED FOR ACTUAL VALUES, set for
1 for now...

SAME FOR POLLUTION OUTPUT, NEEDS TO BE SET FOR ACTUAL VALUES.


UPDATE REMINDER: See DefaultBuildingEditor to change the values of the default
buildings.


Attach to a blank GameObject
*/

#pragma strict



// The two main structures for holding data:

	// This will contain the default information for all building types:
//private var buildings = new Array();
public static var buildings = new Array();
	
// This will contain the information for buildings placed on the grid:
static private var buildingsOnGrid = new Array(); 

	// ********************************************************************************added, keeps track of previous changes
static private var previousBuildings = new Array();



//***NOTE: can use these variables if we want to limit the number of undos, at anytime:
	// Current number of times undos the user is capable of (how many changes to grid have been made)
static private var numberOfUndos = 0;
	// The amount of tiles a building has in range, can be specific to building later on
static public var TILE_RANGE = 2;
	// This will allow for a limited number of undos
static public var undoLimit = 3;
	// Whether or not the player is allowed an unlimited number of undos
static public var limitedUndos = false;
	//*************************************************************************************************
	
	
	
//static private var requisitionSystem : RequisitionSystem;	// AUG 7, added edits to requisition system.



// This is where the hardcoded buildings go of buildings we are aware of:
function Awake ()
{	
	
	//House
	/*var temp = new Building();
	temp.buildingName = "House";
	temp.inputName.push("Fuel");
	temp.inputNum.push(1);
	temp.inputName.push("Power");
	temp.inputNum.push(1);
	temp.outputName.push("Car");
	temp.outputNum.push(1);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);	
	
	//Gas Station
	temp = new Building();
	temp.buildingName = "GasStation";
	temp.inputName.push("Power");
	temp.inputNum.push(1);
	temp.inputName.push("Petroleum");
	temp.inputNum.push(1);
	temp.outputName.push("Gas");
	temp.outputNum.push(1);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);
	
	//Refinery
	temp = new Building();
	temp.buildingName = "Refinery";
	temp.inputName.push("Power");
	temp.inputNum.push(1);
	temp.inputName.push("Car");
	temp.inputNum.push(1);
	temp.outputName.push("Petroleum");
	temp.outputNum.push(1);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);
	
	
	//Power Plant
	temp = new Building();
	temp.buildingName = "PowerPlant";
	temp.inputName.push("Car");
	temp.inputNum.push(1);
	temp.inputName.push("Petroleum");
	temp.inputNum.push(1);
	temp.outputName.push("Power");
	temp.outputNum.push(1);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);
	
	//City
	temp = new Building();
	temp.buildingName = "City";
	temp.inputName.push("Power");
	temp.inputNum.push(3);
	temp.outputName.push("Money");
	temp.outputNum.push(1);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);
	
	//Dam
	temp = new Building();
	temp.buildingName = "HydroDam";
	temp.inputName.push("Car");
	temp.inputNum.push(1);
	temp.outputName.push("Power");
	temp.outputNum.push(3);
	temp.requisitionCost = 1;
	temp.pollutionOutput = 2;
	buildings.push(temp);*/

}// end of Awake


/*
function Start ()
{
	requisitionSystem = GameObject.Find("Database").GetComponent("RequisitionSystem");
}

*/

/*

The addingBuildingToGrid function adds a building to the
buildingsOnGrid array, representing it has been placed on
the grid, based on a given building type name, coordinate,
and the tile type.

*/
static public function addBuildingToGrid(buildingType:String, coordinate:Vector3, tileType:String, building:GameObject, isPreplaced: boolean) : boolean
{

	var temp = new BuildingOnGrid();

	for (var defaultBuilding : Building in buildings)
	{
		if(buildingType == defaultBuilding.buildingName )
		{
		
			temp.buildingName = buildingType;
			
			temp.inputName = new Array();
			temp.inputName = temp.inputName.Concat(defaultBuilding.inputName);
			
			temp.inputNum = new Array();
			temp.inputNum = temp.inputNum.Concat(defaultBuilding.inputNum);
			
			temp.outputName = new Array();
			temp.outputName = temp.outputName.Concat(defaultBuilding.outputName);
			
			temp.outputNum = new Array();
			temp.outputNum = temp.outputNum.Concat(defaultBuilding.outputNum);
			
			temp.requisitionCost = defaultBuilding.requisitionCost;
			
			temp.pollutionOutput = defaultBuilding.pollutionOutput;
			
		}
    }
    temp.buildingPointer = building;
    temp.coordinate = coordinate;
    temp.tileType = tileType;
    
    	
   if( !isPreplaced )
   {
	    buildingsOnGrid.push(temp);
	    	        
	    //adding for undo:
		
		previousBuildings.Add("EndOfAdd");
		previousBuildings.Add(buildingsOnGrid.length - 1); 	// index of new building
		previousBuildings.Add("Add");
		
		numberOfUndos++;
		
		cleanUpPreviousBuildings();
		
		EventSystem.currentTurn += 1;		// NEW: add a turn to the event system
		
		
		BroadcastBuildingUpdate();
		
		//************
		return true;
	}
	else
	{
	
		buildingsOnGrid.push(temp);
	    	        
	    //adding for undo:
		
		previousBuildings.Add("EndOfAdd");
		previousBuildings.Add(buildingsOnGrid.length - 1); 	// index of new building
		previousBuildings.Add("Add");
		
		numberOfUndos++;
		
		cleanUpPreviousBuildings();
		
		//************
		return true;
	
	}
	 
}// end of addBuildingToGrid

/* 
	BroadcastBuildingUpdate:

   This functionality is set in place so when the building is placed and added to grid, all game objects with the "UpdateBuildingCount" function,
   if it exists, will be sent the latest set of buildings from the same call. All that's needed to be done is to have an UpdateBuildingCount function
   with a gameObject array as a parameter and everything should be fine.
   
   Also, this can be refined later via tags so we can separate what we need to update for performance tweaking
*/

public static function BroadcastBuildingUpdate():void
{
	var gameObjInScene:GameObject[] = GameObject.FindObjectsOfType(typeof(GameObject)); //Gets all game objects in scene
	
	for(var gos:GameObject in gameObjInScene)
	{
		if(gos && gos.transform.parent == null) // make sure the GO exists and is the parent, since BroadcastMessage sends to all children
		{
			//Debug.Log("Game object in scene is: " + gos.name);
			gos.gameObject.SendMessage("UpdateBuildingCount", GameObject.FindGameObjectsWithTag("Building"), SendMessageOptions.DontRequireReceiver); //calls that function for all the children on the object, if it exists
		}
	}
}


/*

The findBuildingIndex function is used to identify the index
of the building in the buildingsOnGrid array based on a
given coordinate.

*/
static public function findBuildingIndex( coordinate:Vector3 ): int
{
	var index = 0;


	for (var placedBuilding : BuildingOnGrid in buildingsOnGrid)
	{
		if(coordinate == placedBuilding.coordinate)
		{
			return index;
		}
		
		index++;
	}
	return -1;			// will return -1 if there is no building at the
						// given coordinate, to be used as a check as
						// needed if there is no building at the given
						// coordinate
								
	
}// end of findBuildingIndex

static public function getBuildingAtIndex(index: int):GameObject{
	var toReturn : BuildingOnGrid = buildingsOnGrid[index];
	return (toReturn.buildingPointer);
}

static public function getBuildingsOnGrid(){
	return (buildingsOnGrid);
}


/*

The linkBuildings function is to be used to check if the buildings used for
output and input contain the desired resource to be linked, and then proceeds
to decrease the resource amount for the input and output by one

NOTE: for this database, for buildings on the grid, the number of resources a
building has for input/output indicate non-linked, avaliable resources. Thus
when an input has been reduced to zero, all of its needs have been met (linked
to an output), and when output is reduced to zero, all of its output is
currently being used.

ALSO, the function assumes the two buildings are close enough to be linked,
and that the output building is active (this can be checked as needed using
another function listed later on, although for distance that will have to be
another check)

*/
public function linkBuildings(outputBuildingIndex:int, inputBuildingIndex:int, resourceName:String)
{
	var outputBuilding : BuildingOnGrid = buildingsOnGrid[outputBuildingIndex];
	var inputBuilding : BuildingOnGrid = buildingsOnGrid[inputBuildingIndex];
	
	
	var resourceOutputIndex = 0;
	var resourceInputIndex = 0;
	var hasResource = false;
	
	var resourceNum : int = 0;
	
	// Checks to see if output is there, the amount of the resource
	// is above 0, meaning it is avaliable.
	for (var outputName : String in outputBuilding.outputName)
    {
    	resourceNum = outputBuilding.outputNum[resourceOutputIndex];
    	
        if(resourceName == outputName && resourceNum > 0)
        {
        	hasResource = true;
        }
        
        if(!hasResource)
        {
        	resourceOutputIndex++;
        }
    }
    
    // If it found the resource in the output, it will check for
    // the resource in the building requiring the input
    if(hasResource)
    {
	    hasResource = false;
	    
	    for (var inputName : String in inputBuilding.inputName)
	    {
	    	resourceNum = inputBuilding.inputNum[resourceInputIndex];
	    	
	        if(resourceName == inputName && resourceNum > 0)
	        {
	        	hasResource = true;
	        }
	        
	        if(!hasResource)
	        {
	        	resourceInputIndex++;
	        }
	    }
    }
    
    // If the resource has been found in both buildings,
    // decrease the amount and add the index of the other building
    // in the linkedTo array.
    //
    // AND if there is at least 1 point of requisition to spend:
    if(hasResource)
    {
    
    	//adding for undo:
    	var tempOutputBuilding: BuildingOnGrid = new BuildingOnGrid();
		var tempInputBuilding: BuildingOnGrid = new BuildingOnGrid();
	
		copyBuildingOnGrid(buildingsOnGrid[outputBuildingIndex], tempOutputBuilding);
		copyBuildingOnGrid(buildingsOnGrid[inputBuildingIndex], tempInputBuilding);
	
		previousBuildings.Add("EndOfLink");	
		previousBuildings.Add(tempInputBuilding);
		previousBuildings.Add(inputBuildingIndex);
		previousBuildings.Add(tempOutputBuilding);
		previousBuildings.Add(outputBuildingIndex);
		previousBuildings.Add("Link");
		
		numberOfUndos++;
		
		cleanUpPreviousBuildings();
		
		//****************
    
    
	    resourceNum = outputBuilding.outputNum[resourceOutputIndex];
	    resourceNum--;
	    outputBuilding.outputNum[resourceOutputIndex] = resourceNum;
	    
	    resourceNum = inputBuilding.inputNum[resourceInputIndex];
	    resourceNum--;
	    inputBuilding.inputNum[resourceInputIndex] = resourceNum;
		
		outputBuilding.linkedTo.push(inputBuildingIndex);
		inputBuilding.linkedTo.push(outputBuildingIndex);
	    
	    buildingsOnGrid[outputBuildingIndex] = outputBuilding;
		buildingsOnGrid[inputBuildingIndex] = inputBuilding;
		
		EventSystem.currentTurn += 1;		// NEW: add a turn to the event system
    }
    else
    {
    	Debug.Log("Unable to link buildings due to missing resource or lack of requisition");
    }

}// End of linkBuildings

/*

activateBuilding, when given an index, checks to make sure
the building has no more input requirements, and then sets
the variable isActive to true if so.

*/
public function activateBuilding( buildingIndex:int )
{
	var canActivate = true;
	var building : BuildingOnGrid = buildingsOnGrid[buildingIndex];
	
	for (var inputAmount : int in building.inputNum)
    {
		if(inputAmount != 0)
		{
			canActivate = false;
		}
    }
    
    building.isActive = canActivate;
    buildingsOnGrid[buildingIndex] = building;
	
}


/*

Can be used for special cases where a building may be deactivated
despite having the required input amounts.

*/
public function toggleActiveness( buildingIndex:int )
{
	var building : BuildingOnGrid = buildingsOnGrid[buildingIndex];
	building.isActive = !building.isActive;
    buildingsOnGrid[buildingIndex] = building;
	
}

/*

Used to check if a particular building at a given index is active

*/
public function isActive( buildingIndex:int ): boolean
{
	var building : BuildingOnGrid = buildingsOnGrid[buildingIndex];
	return building.isActive;	
}



/*

Building Class

Instead of just creating a 2D array/matrix, I decided that creating a class for a building
would make it easier to understand the structure of the database (since for the matrix I would
have to create in the comments an explaination as to what which row and column held).

Also, since not all buildings share the same input and output, or even the same amounts of input
and output, this will allow for flexiblity in that regard as well. Since the amount of a specific
resource a building might need is not always 1, that's what the Num arrays are; the corrisponding
values at the matching indexes should indicate the number of resources needed or output by the 
resource named in the other array.

NOTE: This class and the one below uses parallel arrays to store the resource input/output type
and their amounts.

*/


class Building
{
	var buildingName = "nameOfBuilding";

	var inputName = new Array();
	var inputNum = new Array();
	
	var outputName = new Array();
	var outputNum = new Array();
	
	var requisitionCost : int;
	
	var pollutionOutput : int;
}

/*
BuildingOnGrid Class

This contains the information for a building placed on a grid.
Takes the information from the default Building class, but
creates, essentially, a new building so that the data can be
manipulated without affecting the original default building.

We'll have to tweak the code a little based upon what coordinate
is set as, whether a singular value or something like an 2D
coordinate, which shouldn't be too diffcult since most
of the functions use index.

*/


class BuildingOnGrid
{

	var buildingName = "nameOfBuilding";
	var inputName = new Array();
	var inputNum = new Array();
	var outputName = new Array();
	var outputNum = new Array();
	
	var isActive = false;
	
	var coordinate : Vector3 = new Vector3(0,0,0);
	var tileType = "tileType";
	var buildingPointer: GameObject;
	var linkedTo = new Array();	// will contain an array of the buildings it is connected to, by index of the building in the array
	
	var requisitionCost : int;
	
	var pollutionOutput : int;
	
}




//********************************************************************Updated for Undo Function:



function copyBuildingOnGrid( copyFrom:BuildingOnGrid, copyTo:BuildingOnGrid )
{
	
	copyTo.buildingName = copyFrom.buildingName;
	
	copyTo.inputName.Clear();
	copyTo.inputName = copyTo.inputName.Concat(copyFrom.inputName);
	copyTo.inputNum.Clear();
	copyTo.inputNum = copyTo.inputNum.Concat(copyFrom.inputNum);
	
	copyTo.outputName.Clear();
	copyTo.outputName = copyTo.outputName.Concat(copyFrom.outputName);
	copyTo.outputNum.Clear();
	copyTo.outputNum = copyTo.outputNum.Concat(copyFrom.outputNum);

	copyTo.isActive = copyFrom.isActive;
	copyTo.coordinate = copyFrom.coordinate;
	copyTo.tileType = copyFrom.tileType;

	copyTo.linkedTo.Clear();
	copyTo.linkedTo = copyTo.linkedTo.Concat(copyFrom.linkedTo);
	
	copyTo.requisitionCost = copyFrom.requisitionCost;
	copyTo.pollutionOutput = copyFrom.pollutionOutput;

} // end of copyBuildingOnGrid



// Returns true if undo was successful, false if there is nothing to undo
// Can add more than link and add (linking buildings and adding to grid)
// if there are more actions the player can undo; this is assuming other actions
// are taken by the game rather than the player themselves.

// The previousBuildings array will store the building's info before
// it was changed, followed by the index of the building, and then lastly the
// type of change. It is set up to have as many undos as we would like, by changing
// the number of previousBuildingsLimit, keeping in mind that there are 6 elements
// added for linking buildings, and 3 added for adding a building.

function undo(): boolean
{

	if ( previousBuildings.length > 0 )
	{
		var typeOfUndo = previousBuildings.Pop();
	
		if( typeOfUndo == "Link" )
		{
			// resetting the output building:
			var buildingIndex = previousBuildings.Pop();
			copyBuildingOnGrid(previousBuildings.Pop(), buildingsOnGrid[buildingIndex]);
			
			//resetting the input building:
			buildingIndex = previousBuildings.Pop();
			copyBuildingOnGrid(previousBuildings.Pop(), buildingsOnGrid[buildingIndex]);
			
			
			return true;
			
		}		
		else if( typeOfUndo == "Add")
		{
			//buildingPointer
			var buildingID = previousBuildings.Pop();
			var buildingToDelete : BuildingOnGrid = buildingsOnGrid[buildingID];
			Destroy(buildingToDelete.buildingPointer);
			buildingsOnGrid.Splice(buildingID, 1);
			previousBuildings.Pop();
			
			
			return true;
		}
		else
		{
			return false;
		}
	
	}
	else
	{
		return false;
	}

}// end of undo()

// Cleans up the array used to keep track of previous states
// by removing the least recent change
static function cleanUpPreviousBuildings()
{
	if(limitedUndos)
	{
		
		if( numberOfUndos > undoLimit )
		{
			var typeOfUndo = previousBuildings.Shift();	// #1
		
			if(typeOfUndo == "EndOfAdd")
			{
				previousBuildings.Shift();	//#2, the index of the building
				previousBuildings.Shift();	//#3, the "Add"
				
				numberOfUndos--;
			}
			else if(typeOfUndo == "EndOfLink")
			{
				previousBuildings.Shift();	//#2, the Input building 
				previousBuildings.Shift();	//#3, the Input index
				previousBuildings.Shift();	//#4, the Output building
				previousBuildings.Shift();	//#5, the Output index
				previousBuildings.Shift();	//#6, the "Link"
				
				numberOfUndos--;
			}
					
		}
	}
}// end of cleanUpPreviousBuildings()



// This function adds up the pollution output for all buildings on
// the grid and returns that value.
static public function totalPollution(): int
{
	var pollution : int = 0;

	for (var placedBuilding : BuildingOnGrid in buildingsOnGrid)
	{
		pollution += placedBuilding.pollutionOutput;
	}
	return pollution;

}// end of totalPollution








//********************************************************************Updated for Check for Win State:

// This function will need to be called during an update function, or whenever the game
// wants to check for a win state. At the moment, it just checks to see if all buildings
// that are on the grid are active. Returns true if all are active, false if not.
// Can be used to trigger another even, like loading another level, or calling another function, etc.

function testWinState(): boolean
{
	
	for (var placedBuilding : BuildingOnGrid in buildingsOnGrid)
	{
		//only checks houses and cities
		if(placedBuilding.buildingName == "House" || placedBuilding.buildingName == "City")
		{
			if(placedBuilding.isActive == false)
			{
				//if any of the buildings are not active, will return false
				return false;
			}
		}
	}
	//will only make it this far after going through all the buildings and finding none of them false
	return true;
	
}// end of testWinState
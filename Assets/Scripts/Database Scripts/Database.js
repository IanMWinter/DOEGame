/*
Database.js
By Katharine Uvick

This script will be used to store data of the different specific buildings
involved in the game, as well as the buildings currently placed on the grid.

It uses a series of arrays to store the data in order to keep the information
organized and flexible, rather than a fixed matrix or 2d array that would need
to be detailed on what each column and row represented.


Attach to a blank GameObject
*/

#pragma strict



// The two main structures for holding data:

	// This will contain the default information for all building types:
private var buildings = new Array();
	// This will contain the information for buildings placed on the grid:
private var buildingsOnGrid = new Array(); 




// This is where the hardcoded buildings go of buildings we are aware of:
function Awake ()
{

	//House
	var temp = new Building();
	temp.buildingName = "House";
	temp.inputName.push("Fuel");
	temp.inputNum.push(1);
	temp.inputName.push("Power");
	temp.inputNum.push(1);
	temp.outputName.push("Car");
	temp.outputNum.push(1);
	buildings.push(temp);	
	
	//Gas Station
	temp = new Building();
	temp.buildingName = "Gas Station";
	temp.inputName.push("Power");
	temp.inputNum.push(1);
	temp.inputName.push("Petroleum");
	temp.inputNum.push(1);
	temp.outputName.push("Gas");
	temp.outputNum.push(1);
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
	buildings.push(temp);
	
	//City
	temp = new Building();
	temp.buildingName = "City";
	temp.inputName.push("Power");
	temp.inputNum.push(3);
	temp.outputName.push("Money");
	temp.outputNum.push(1);
	buildings.push(temp);
	
	//Dam
	temp = new Building();
	temp.buildingName = "Dam";
	temp.inputName.push("Car");
	temp.inputNum.push(1);
	temp.outputName.push("Power");
	temp.outputNum.push(3);
	buildings.push(temp);

}// end of Awake


/*

The addingBuildingToGrid function adds a building to the
buildingsOnGrid array, representing it has been placed on
the grid, based on a given building type name, coordinate,
and the tile type.

*/
public function addBuildingToGrid(buildingType:String, coordinate:int, tileType:String)
{
	var temp = new BuildingOnGrid();

	for (var defaultBuilding : Building in buildings)
	{
		if(buildingType == defaultBuilding.buildingName)
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
			
		}
    }
    
    temp.coordinate = coordinate;
    temp.tileType = tileType;
    
    buildingsOnGrid.push(temp);
	
	
}// end of addBuildingToGrid



/*

The findBuildingIndex function is used to identify the index
of the building in the buildingsOnGrid array based on a
given coordinate.

*/
public function findBuildingIndex( coordinate ): int
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
	
	
	print("output: " + outputBuilding.buildingName);
	print("input: " + inputBuilding.buildingName);
	
	
	
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
    if(hasResource)
    {
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
	
	var coordinate = 0;
	var tileType = "tileType";
	var linkedTo = new Array();	// will contain an array of the buildings it is connected to, by index of the building in the array
	var scoreAchieved = 0;
	
}








/*
//*********************************Used for testing:






function Start ()
{
	testValuesInBuildings();
	addBuildingToGrid("Dam", 6, "Grass");
	addBuildingToGrid("House", 3, "Grass");
	testValuesInBuildingsOnGrid();
	linkBuildings(1,0,"Car");
	testValuesInBuildingsOnGrid();
	testValuesInBuildings();
}


function testValuesInBuildings()
{
	print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

	for (var singleBuilding : Building in buildings)
	{
        print("Name:" + singleBuilding.buildingName);
        
	    for (var inputName : String in singleBuilding.inputName)
	    {
	        print("Input:" + inputName);
	    }
	    
	   	for (var inputNum : int in singleBuilding.inputNum)
	    {
	        print("InputNum:" + inputNum);
	    }
	    
	    for (var outputName : String in singleBuilding.outputName)
	    {
	        print("Output:" + outputName);
	    }
	    
	   	for (var outputNum : int in singleBuilding.outputNum)
	    {
	        print("OutNum:" + outputNum);
	    }
	        
        
        print("******************");
        
    }
    
    print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

}



function testValuesInBuildingsOnGrid()
{
	print("-------------------------------------------");
	for (var placedBuilding : BuildingOnGrid in buildingsOnGrid)
	{		
        print("Name:" + placedBuilding.buildingName);
        
	    for (var inputName : String in placedBuilding.inputName)
	    {
	        print("Input:" + inputName);
	    }
	    
	   	for (var inputNum : int in placedBuilding.inputNum)
	    {
	        print("InputNum:" + inputNum);
	    }
	    
	    for (var outputName : String in placedBuilding.outputName)
	    {
	        print("Output:" + outputName);
	    }
	    
	   	for (var outputNum : int in placedBuilding.outputNum)
	    {
	        print("OutNum:" + outputNum);
	    }
	    
	    print("Coordinate:" + placedBuilding.coordinate);
	    print("Tile Type:" + placedBuilding.tileType);
	    
	    for (var linkedIndex : int in placedBuilding.linkedTo)
	    {
	        print("Linked To:" + linkedIndex);
	    }
	    
	    print("Score:" + placedBuilding.scoreAchieved);

	}
	
	print("-------------------------------------------");
}

*/
// InstructorDashboard.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const InstructorDashboard = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 5;

  useEffect(() => {
    if (user) fetchBatches(user.userId);
  }, [user]);

  const fetchBatches = async (userId) => {
    try {
      const response = await fetch("http://localhost:7550/api/batches/all");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Process batches and filter groups
      const batchesWithFilteredGroups = data.map((batch) => {
        let groups = [];

        try {
          // Parse the groups string
          const groupsString = JSON.parse(batch.groups); // Correctly parse the doubly encoded JSON
          groups = JSON.parse(groupsString);

        } catch (error) {
          console.error("Error parsing groups:", error);
          groups = []; // Handle error by setting an empty groups array
        }

        // Filter groups to only include those where the instructor is present
        const filteredGroups = groups.filter(group => {
          return group.instructors && Array.isArray(group.instructors) && group.instructors.includes(userId);
        }).map(group => ({
          ...group,
          id: group.groupName, // Use groupName as ID
        }));

        const instructorIds = JSON.parse(batch.instructorNames || "[]")

        return {
          ...batch,
          groups: filteredGroups,
          isInstructorInBatch: instructorIds.includes(userId)
        };
      });

      setBatches(batchesWithFilteredGroups.sort((a, b) => a.batchName.localeCompare(b.batchName)));
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };
  

  const indexOfLastBatch = currentPage * batchesPerPage;
  const currentBatches = batches.slice(indexOfLastBatch - batchesPerPage, indexOfLastBatch);

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-lg text-center">
        <h1 className="text-lg font-semibold">Empower Learners, Elevate Your Impact!</h1>
        <p>Your guidance makes a difference stay committed and become a top mentor!</p>
      </div>

      <div className="mt-6">
        <input type="text" placeholder="Search" className="w-full p-2 border rounded-md" />
      </div>

      <div className="mt-6">
        {batches.length === 0 ? (
          <p>No batches found for you as an instructor.</p>
        ) : (
          currentBatches.map((batch) => (
            <Card key={batch.batchId} className="mb-4 p-4">
              <CardContent>
                <h2 className="text-lg font-semibold">{batch.batchName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batch.groups.length === 0 ? (
                    <p>No groups found for this batch.</p>
                  ) : (
                    batch.groups.map((group) => (
                      <div key={group.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold">{group.groupName}</h3>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {batches.length > batchesPerPage && (
        <div className="mt-6 flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * batchesPerPage >= batches.length}
            className="px-4 py-2"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
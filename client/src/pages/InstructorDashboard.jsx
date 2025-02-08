import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const InstructorDashboard = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const batchesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    const actualUserId = user && (user.userId || user.userID);
    console.log("Actual User ID:", actualUserId);
    if (user && actualUserId) fetchBatches(actualUserId);
  }, [user]);

  const fetchBatches = async (userId) => {
    console.log("fetchBatches called with userId:", userId);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:7550/api/batches/all");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const filteredBatches = data
        .map((batch) => {
          let groups = [];
          try {
            groups = JSON.parse(JSON.parse(batch.groups));
          } catch (error) {
            console.error("Error parsing groups:", error);
            return null;
          }

          let instructorIds = [];
          try {
            instructorIds = JSON.parse(
              JSON.parse(batch.instructorNames || "[]")
            );
            if (!Array.isArray(instructorIds)) {
              console.warn(
                "instructorNames is not an array, skipping batch",
                batch
              );
              return null;
            }
          } catch (error) {
            console.error("Error parsing instructorNames:", error);
            return null;
          }

          const isInstructorInBatch = instructorIds.includes(userId);
          if (!isInstructorInBatch) return null;

          const filteredGroups = groups.filter(
            (group) =>
              Array.isArray(group.instructors) &&
              group.instructors.includes(userId)
          );

          return filteredGroups.length > 0
            ? { ...batch, groups: filteredGroups }
            : null;
        })
        .filter(Boolean);

      setBatches(filteredBatches.sort((a, b) => a.batchName.localeCompare(b.batchName)));
    } catch (error) {
      console.error("Error fetching batches:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (batchName, groupName) => {
    navigate(`/instructor/group-students/${batchName}/${groupName}`);
  };

  const indexOfLastBatch = currentPage * batchesPerPage;
  const currentBatches = batches.slice(
    indexOfLastBatch - batchesPerPage,
    indexOfLastBatch
  );

  const showBatches = () => {
    if (loading) return <p>Loading batches...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    if (batches.length === 0) {
      return <p>No batches found for you as an instructor.</p>;
    }

    return currentBatches.map((batch) => (
      <Card key={batch.batchId} className="mb-4 p-4">
        <CardContent>
          <h2 className="text-lg font-semibold">{batch.batchName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batch.groups.length === 0 ? (
              <p>No groups found for this batch.</p>
            ) : (
              batch.groups.map((group) => (
                <Button
                  key={group.groupName}
                  variant="ghost"
                  className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleGroupClick(batch.batchName, group.groupName)}
                >
                  <h3 className="font-semibold">{group.groupName}</h3>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-lg text-center">
        <h1 className="text-lg font-semibold">
          Empower Learners, Elevate Your Impact!
        </h1>
        <p>Your guidance makes a difference stay committed and become a top mentor!</p>
      </div>

      <div className="mt-6">
        <input type="text" placeholder="Search" className="w-full p-2 border rounded-md" />
      </div>

      <div className="mt-6">{showBatches()}</div>

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
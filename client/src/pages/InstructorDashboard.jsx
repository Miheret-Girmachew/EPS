import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { Home, BookOpen, Users, DollarSign } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function MyCourses() {
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      setUser({
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
      });

      fetchBatches(decoded.user_id);
    }
  }, []);

  const fetchBatches = async (userId) => {
    try {
      const response = await fetch("http://localhost:7550/api/batches/all");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const batchesWithInstructor = data
        .map((batch) => {
          const instructorIds = batch.instructors || [];
          const isInstructorInBatch = instructorIds.includes(userId);

          let groups = [];
          try {
            const jsonString = JSON.parse(batch.groups);
            groups = JSON.parse(jsonString);
          } catch (error) {
            console.error("Error parsing groups:", error);
            groups = [];
          }

          if (!Array.isArray(groups)) {
            groups = [];
          }

          batch.groups = groups.filter((group) => {
            // Filter groups to only include those where the instructor is present
            return group.instructors && group.instructors.includes(userId);
          }).map((group) => ({
            ...group,
            id: group.groupName,
          }));

          return {
            ...batch,
            isInstructorInBatch,
            groups,
          };
        })
        .sort((a, b) => a.batchName.localeCompare(b.batchName));

      batchesWithInstructor.forEach((batch) => {
        batch.groups = batch.groups.sort((a, b) => a.groupName.localeCompare(b.groupName));
      });

      setBatches(batchesWithInstructor);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Get current batches for the current page
  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = batches.slice(indexOfFirstBatch, indexOfLastBatch);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white p-4 border-r">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Loading..."}</h2>
            <p className="text-sm text-gray-500">{user ? user.email : "Loading..."}</p>
          </div>
        </div>
       
        <nav className="mt-6 space-y-2">
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <Home size={18} /> <span>Dashboard</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2 bg-purple-100">
            <BookOpen size={18} /> <span>My Courses</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <Users size={18} /> <span>Students</span>
          </Button>
          <Button variant="ghost" className="w-full flex items-center space-x-2">
            <DollarSign size={18} /> <span>Payout</span>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
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
                          {batch.isInstructorInBatch && (
                            <p className="text-sm text-green-500">You are an instructor in this batch</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {batches.length > batchesPerPage && (
          <div className="mt-6 flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * batchesPerPage >= batches.length}
              className="px-4 py-2"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

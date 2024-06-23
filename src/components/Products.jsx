import { useState, useEffect } from "react";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";
import { BiCube } from "react-icons/bi";
import Hero from "./Hero";
import Modal from "./Modal";
import { getAllProjects } from "../../utils/crowdfunding";
import { ethers } from "ethers";
import CrowdfundingAbi from "../abi/Crowdfunding.json";

const Products = ({ searchFocus, setSearchFocus, searchRef }) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getAllProjects();
      const formattedProjects = projects.map((project, index) => ({
        id: index + 1,
        name: `Project ${index + 1}`,
        companyName: project.companyName,
        fundingGoal: `${ethers.utils
          .formatEther(project.fundingGoal)
          .toString()} ETH`,
        amountRaised: `${ethers.utils
          .formatEther(project.funded)
          .toString()} ETH`,
      }));

      setStartups(formattedProjects);
      setFilteredStartups(formattedProjects);
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = startups.filter((startup) =>
      startup.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStartups(filtered);
  }, [searchQuery, startups]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);

  const handleCardClick = (startup) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStartup(null);
  };

  const contributeFunds = async (projectId, amount) => {
    if (!window.ethereum) {
      alert("MetaMask is required to contribute funds");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      "0x38420dF5F67DEbE6d6f62176582FB36cF49a0B65",
      CrowdfundingAbi,
      signer
    );

    const tx = await contract.contributeFunds(projectId, {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    alert("Contribution successful!");
  };

  return (
    <>
      <Hero
        searchFocus={searchFocus}
        setSearchFocus={setSearchFocus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchRef={searchRef}
      />
      <div className="w-4/5 m-auto space-y-10 mb-20">
        <div className="flex justify-between items-center p-2">
          <ul className="flex items-center space-x-6 text-gray-800 text-lg font-medium">
            <li className="flex items-center space-x-2 cursor-pointer hover:text-blue-500">
              <BiCube size={24} />
              <span>All Startups</span>
            </li>
          </ul>
        </div>
        <div className="products grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
          {filteredStartups.map((startup) => (
            <div
              key={startup.id}
              className="product rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={() => handleCardClick(startup)}
            >
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-800">
                  {startup.name}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {startup.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Goal: {startup.fundingGoal}
                    </p>
                    <p className="text-sm text-gray-600">
                      Raised: {startup.amountRaised}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedStartup && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            startup={selectedStartup}
            contributeFunds={contributeFunds}
          />
        )}
      </div>
    </>
  );
};

export default Products;

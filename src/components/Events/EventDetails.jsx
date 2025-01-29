import { useState } from "react";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "../Header.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const prams = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", prams.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: prams.id }),
  });

  const {
    mutate,
    isPending: isDeletingPending,
    isError: isDeletingError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDelete = () => {
    mutate({ id: prams.id });
  };

  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching details data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch event"}
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button type="button" onClick={handleStartDelete}>
              Delete
            </button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>This action cannot be undone.</p>
          <div className="form-actions">
            {isDeletingPending && <p>Deleting...</p>}
            {!isDeletingPending && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isDeletingError && (
            <ErrorBlock
              title="An error occurred"
              message={
                deleteError.info.message ||
                "Failed to delete. Please try again later."
              }
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}

import React from "react";
import { render, fireEvent, wait } from "react-testing-library";
import { MockedProvider } from "react-apollo/test-utils";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "util/context";
import Login, { LOGIN } from "./Login";

jest.mock("react-router-dom", () => ({
  MemoryRouter: jest.requireActual("react-router-dom").MemoryRouter,
  Redirect: () => <div className="redirect" />,
}));

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  },
};

describe("Login", () => {
  it("renders correctly when authenticated", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ token: "abc", setAuth: jest.fn() }}>
          <MockedProvider
            mocks={[]}
            addTypename={false}
            defaultOptions={defaultOptions}
          >
            <Login />
          </MockedProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly when unauthenticated", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ setAuth: jest.fn() }}>
          <MockedProvider
            mocks={[]}
            addTypename={false}
            defaultOptions={defaultOptions}
          >
            <Login />
          </MockedProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it("logs in", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: { email: "john@lvh.me", password: "password" },
        },
        result: { data: { authenticate: { id: 123, token: "abc" } } },
      },
    ];
    const setAuth = jest.fn();
    const { getByLabelText, getByText } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ setAuth }}>
          <MockedProvider
            mocks={mocks}
            addTypename={false}
            defaultOptions={defaultOptions}
          >
            <Login />
          </MockedProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    fireEvent.change(getByLabelText("Email address"), {
      target: { value: "john@lvh.me" },
    });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(getByText("Log in"));
    await wait(() => expect(setAuth).toBeCalledWith({ id: 123, token: "abc" }));
  });
});
